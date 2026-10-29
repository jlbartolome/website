"""Render the owner-supplied Blender scene with reversible website styling.

blender --background --disable-autoexec artwork/hero/small_epolaron.blend \
  --python scripts/render-hero.py -- --output /tmp/hero.png --width 1448
"""
import argparse
import hashlib
import json
import math
import struct
import sys
from pathlib import Path

import bpy
from mathutils import Matrix, Vector


ORBITAL_GREEN = '#AED8BF'


def arguments():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', required=True)
    parser.add_argument('--width', type=int, default=1448)
    parser.add_argument('--samples', type=int, default=512)
    parser.add_argument('--save-blend')
    parser.add_argument('--audit')
    return parser.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])


def geometry_digest(obj):
    """Fingerprint vertex coordinates, connectivity and object transform."""
    import array
    vertices = array.array('f', [0]) * (len(obj.data.vertices) * 3)
    obj.data.vertices.foreach_get('co', vertices)
    indices = array.array('i', [0]) * len(obj.data.loops)
    obj.data.loops.foreach_get('vertex_index', indices)
    transform = array.array('f', [value for row in obj.matrix_world for value in row])
    return hashlib.sha256(vertices.tobytes() + indices.tobytes() + transform.tobytes()).hexdigest()


def linear_color(hex_color):
    srgb = [int(hex_color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    return tuple(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb) + (1,)


def satin_material(name, color, alpha=1, relief=0.14, sheen=0, highlight_power=18):
    """Illustrative satin shading with a restrained, broad white highlight."""
    material = bpy.data.materials.new(name)
    if material.node_tree is None:
        material.use_nodes = True
    material.diffuse_color = linear_color(color)[:3] + (alpha,)
    material['hero_sheen'] = sheen
    material['hero_highlight_power'] = highlight_power
    material['hero_color'] = color
    tree = material.node_tree
    tree.nodes.clear()
    out = tree.nodes.new('ShaderNodeOutputMaterial')
    emission = tree.nodes.new('ShaderNodeEmission')
    emission.inputs['Color'].default_value = linear_color(color)
    geometry = tree.nodes.new('ShaderNodeNewGeometry') if relief or sheen else None
    base = tree.nodes.new('ShaderNodeVectorMath')
    base.operation = 'SCALE'
    base.inputs[0].default_value = linear_color(color)[:3]
    base.inputs['Scale'].default_value = 1
    if relief:
        light = tree.nodes.new('ShaderNodeVectorMath')
        light.operation = 'DOT_PRODUCT'
        light.inputs[1].default_value = Vector((0.6, 0.75, 0.85)).normalized()
        scale = tree.nodes.new('ShaderNodeMath')
        scale.operation = 'MULTIPLY_ADD'
        scale.inputs[1].default_value = relief
        scale.inputs[2].default_value = 1 - relief
        tree.links.new(geometry.outputs['Normal'], light.inputs[0])
        tree.links.new(light.outputs['Value'], scale.inputs[0])
        tree.links.new(scale.outputs[0], base.inputs['Scale'])
    color_output = base.outputs['Vector']
    if sheen:
        # A stylized softbox highlight, baked into the web model alongside the
        # form shading. It adds polish without introducing photographic lighting.
        half_vector = (Vector((0.6, 0.75, 0.85)).normalized() +
                       Vector((14, 2.7, 4.2)).normalized()).normalized()
        shine_dot = tree.nodes.new('ShaderNodeVectorMath')
        shine_dot.operation = 'DOT_PRODUCT'
        shine_dot.inputs[1].default_value = half_vector
        tree.links.new(geometry.outputs['Normal'], shine_dot.inputs[0])
        positive = tree.nodes.new('ShaderNodeMath')
        positive.operation = 'MAXIMUM'
        positive.inputs[1].default_value = 0
        tree.links.new(shine_dot.outputs['Value'], positive.inputs[0])
        power = tree.nodes.new('ShaderNodeMath')
        power.operation = 'POWER'
        power.inputs[1].default_value = highlight_power
        tree.links.new(positive.outputs[0], power.inputs[0])
        amount = tree.nodes.new('ShaderNodeMath')
        amount.operation = 'MULTIPLY'
        amount.inputs[1].default_value = sheen
        tree.links.new(power.outputs[0], amount.inputs[0])
        polished = tree.nodes.new('ShaderNodeVectorMath')
        polished.operation = 'ADD'
        tree.links.new(color_output, polished.inputs[0])
        tree.links.new(amount.outputs[0], polished.inputs[1])
        color_output = polished.outputs['Vector']
    # Match the normalized vertex colors used by the GLB. In particular, a
    # polished glass facet must not gain extra emission energy in the PNG.
    bounded = tree.nodes.new('ShaderNodeVectorMath')
    bounded.operation = 'MINIMUM'
    bounded.inputs[1].default_value = (1, 1, 1)
    tree.links.new(color_output, bounded.inputs[0])
    tree.links.new(bounded.outputs['Vector'], emission.inputs['Color'])
    if alpha < 1:
        transparent = tree.nodes.new('ShaderNodeBsdfTransparent')
        mix = tree.nodes.new('ShaderNodeMixShader')
        mix.inputs[0].default_value = alpha
        tree.links.new(transparent.outputs[0], mix.inputs[1])
        tree.links.new(emission.outputs[0], mix.inputs[2])
        tree.links.new(mix.outputs[0], out.inputs['Surface'])
    else:
        tree.links.new(emission.outputs[0], out.inputs['Surface'])
    return material


def assign(obj, material, smooth=True):
    obj.data.materials.clear()
    obj.data.materials.append(material)
    for polygon in obj.data.polygons:
        polygon.material_index = 0
        polygon.use_smooth = smooth


def add_edges(octahedron, material):
    vertices = [octahedron.matrix_world @ vertex.co for vertex in octahedron.data.vertices]
    curve = bpy.data.curves.new('Octahedron edge guides', 'CURVE')
    curve.dimensions = '3D'
    curve.bevel_depth = 0.04
    curve.bevel_resolution = 3
    for edge in octahedron.data.edges:
        spline = curve.splines.new('POLY')
        spline.points.add(1)
        for point, index in zip(spline.points, edge.vertices):
            point.co = (*vertices[index], 1)
    obj = bpy.data.objects.new('Octahedron edge guides', curve)
    bpy.context.scene.collection.objects.link(obj)
    curve.materials.append(material)
    return obj


def components(mesh):
    adjacent = [[] for _ in mesh.vertices]
    for edge in mesh.edges:
        a, b = edge.vertices
        adjacent[a].append(b)
        adjacent[b].append(a)
    seen = set()
    for root in range(len(mesh.vertices)):
        if root in seen:
            continue
        stack, indices = [root], []
        seen.add(root)
        while stack:
            index = stack.pop()
            indices.append(index)
            for neighbor in adjacent[index]:
                if neighbor not in seen:
                    seen.add(neighbor)
                    stack.append(neighbor)
        yield indices


def diagram_arrows(source, start_sites, material, radius):
    """Restyle arrows while retaining each source start site and cone tip."""
    vectors = []
    for indices in components(source.data):
        if len(indices) != 129:  # Source cone: 128-vertex base plus one tip.
            continue
        vertices = [source.matrix_world @ source.data.vertices[i].co for i in indices]
        mean = sum(vertices, Vector()) / len(vertices)
        tip = max(vertices, key=lambda v: (v - mean).length)
        start = min(start_sites, key=lambda v: (v - mean).length)
        vector = tip - start
        head_length = min(0.78, vector.length * 0.28)
        neck = tip - vector.normalized() * head_length
        bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=radius,
                                           depth=(neck - start).length,
                                           location=(neck + start) * 0.5)
        shaft = bpy.context.object
        shaft.name = source.name + ' · diagram shaft'
        shaft.rotation_euler = vector.to_track_quat('Z', 'Y').to_euler()
        assign(shaft, material)
        bpy.ops.mesh.primitive_cone_add(vertices=32, radius1=radius * 3.2,
                                       radius2=0, depth=head_length,
                                       location=(neck + tip) * 0.5)
        head = bpy.context.object
        head.name = source.name + ' · diagram head'
        head.rotation_euler = vector.to_track_quat('Z', 'Y').to_euler()
        assign(head, material)
        vectors.append({'start': list(start), 'tip': list(tip)})
    source.hide_render = True
    source.hide_viewport = True
    return vectors


def round_orbitals(obj):
    """Round each lobe within its original bounds, using a reversible shape key."""
    groups = list(components(obj.data))
    original = [v.co.copy() for v in obj.data.vertices]
    smooth = obj.modifiers.new('Gentle volume-preserving rounding', 'LAPLACIANSMOOTH')
    smooth.iterations = 24
    smooth.lambda_factor = 0.65
    smooth.use_volume_preserve = True
    smooth.use_normalized = True
    bpy.context.view_layer.update()
    evaluated = obj.evaluated_get(bpy.context.evaluated_depsgraph_get())
    mesh = evaluated.to_mesh()
    softened = [v.co.copy() for v in mesh.vertices]
    evaluated.to_mesh_clear()
    obj.modifiers.remove(smooth)
    obj.shape_key_add(name='Source surface')
    rounded = obj.shape_key_add(name='Website rounding')
    for indices in groups:
        original_lo = [min(original[i][axis] for i in indices) for axis in range(3)]
        original_hi = [max(original[i][axis] for i in indices) for axis in range(3)]
        smooth_lo = [min(softened[i][axis] for i in indices) for axis in range(3)]
        smooth_hi = [max(softened[i][axis] for i in indices) for axis in range(3)]
        for i in indices:
            for axis in range(3):
                span = smooth_hi[axis] - smooth_lo[axis]
                rounded.data[i].co[axis] = (original_lo[axis] +
                    (softened[i][axis] - smooth_lo[axis]) / span *
                    (original_hi[axis] - original_lo[axis])) if span > 1e-9 else original[i][axis]
    rounded.value = 1
    subdivision = obj.modifiers.new('Smooth lobe silhouettes', 'SUBSURF')
    subdivision.subdivision_type = 'CATMULL_CLARK'
    subdivision.levels = 1
    subdivision.render_levels = 2


def add_rotation_rings(materials):
    """Two nearly complete circular arrows around the model's axial Y direction."""
    for index, (radius, start, thickness) in enumerate([(4.8, 0.2, 0.028), (5.6, 2.9, 0.023)]):
        curve = bpy.data.curves.new(f'Rotation ring {index + 1}', 'CURVE')
        curve.dimensions = '3D'
        curve.bevel_depth = thickness
        curve.bevel_resolution = 3
        end = start + 2 * math.pi - 0.14
        y = -4.95
        spline = curve.splines.new('POLY')
        spline.points.add(255)
        for i, point in enumerate(spline.points):
            angle = start + (end - start) * i / 255
            point.co = (radius * math.cos(angle), y, radius * math.sin(angle), 1)
        ring = bpy.data.objects.new(curve.name, curve)
        bpy.context.scene.collection.objects.link(ring)
        material = materials[index]
        curve.materials.append(material)
        tip = Vector((radius * math.cos(end), y, radius * math.sin(end)))
        direction = Vector((-math.sin(end), 0, math.cos(end)))
        bpy.ops.mesh.primitive_cone_add(vertices=32, radius1=0.105, radius2=0,
                                       depth=0.32, location=tip - direction * 0.16)
        head = bpy.context.object
        head.name = f'Rotation direction {index + 1}'
        head.rotation_euler = direction.to_track_quat('Z', 'Y').to_euler()
        assign(head, material)


def fit_camera(scene):
    camera = scene.camera
    camera.data.type = 'ORTHO'
    camera.data.clip_start = 0.01
    camera.data.clip_end = 1000
    # World Y is the source model's axial direction. Preserve it upright.
    back = Vector((14, 2.7, 4.2)).normalized()
    right = Vector((0, 1, 0)).cross(back).normalized()
    up = back.cross(right).normalized()
    rotation = Matrix((right, up, back)).transposed()
    bpy.context.view_layer.update()
    depsgraph = bpy.context.evaluated_depsgraph_get()
    projected = []
    for obj in scene.objects:
        if obj.hide_render or obj.type not in ('MESH', 'CURVE'):
            continue
        evaluated = obj.evaluated_get(depsgraph)
        mesh = evaluated.to_mesh()
        projected.extend(rotation.transposed() @ (evaluated.matrix_world @ v.co)
                         for v in mesh.vertices)
        evaluated.to_mesh_clear()
    lo = Vector(tuple(min(p[i] for p in projected) for i in range(3)))
    hi = Vector(tuple(max(p[i] for p in projected) for i in range(3)))
    middle = (lo + hi) * 0.5
    camera.location = rotation @ Vector((middle.x, middle.y, hi.z + 30))
    camera.rotation_euler = rotation.to_euler()
    ratio = scene.render.resolution_x / scene.render.resolution_y
    # Ortho scale is the horizontal span for a landscape image.
    camera.data.ortho_scale = max(hi.x - lo.x, (hi.y - lo.y) * ratio) / 0.84
    camera.data.shift_x = 0
    camera.data.shift_y = 0


def main():
    args = arguments()
    scene = bpy.context.scene
    meshes = [obj for obj in scene.objects if obj.type == 'MESH']
    before = {obj.name: geometry_digest(obj) for obj in meshes}
    expected = ['Shape_IndexedFaceSet'] + [f'Shape_IndexedFaceSet.{i:03}' for i in range(1, 7)]
    if sorted(before) != sorted(expected):
        raise RuntimeError('The render preset expects the supplied small_epolaron scene.')

    materials = {
        'center': satin_material('EHU · central site', '#5FD790', 1, 0.14, 0.22),
        'anion_arrows': satin_material('EHU · anion displacements', '#6F9580', 1, 0.14, 0.10),
        'corner_arrows': satin_material('EHU · corner displacements', '#B4C2B9'),
        'anions': satin_material('EHU · anion sites', '#9EC3AD', 1, 0.18, 0.30),
        'corners': satin_material('EHU · corner sites', '#D8E3DC'),
        'faces': satin_material('EHU · octahedral faces', '#D5E6DE', 0.34, 0.14, 0.80, 5),
        'orbitals': satin_material('EHU · orbital surface', ORBITAL_GREEN, 0.88, 0.22, 0.26, 14),
        'edges': satin_material('EHU · octahedral edges', '#94ACA0', 1, 0.14, 0.70, 40),
        'inner_ring': satin_material('EHU · inner rotation ring', ORBITAL_GREEN, 1, 0),
        'outer_ring': satin_material('EHU · outer rotation ring', ORBITAL_GREEN, 1, 0),
    }
    roles = dict(zip(expected, ['center', 'anion_arrows', 'corner_arrows', 'anions', 'corners', 'faces', 'orbitals']))
    for obj in meshes:
        assign(obj, materials[roles[obj.name]], smooth=roles[obj.name] != 'faces')
    octahedron = bpy.data.objects['Shape_IndexedFaceSet.005']
    add_edges(octahedron, materials['edges'])
    anion_sites = [octahedron.matrix_world @ v.co for v in octahedron.data.vertices]
    for name in ['Shape_IndexedFaceSet.002', 'Shape_IndexedFaceSet.004']:
        bpy.data.objects[name].hide_render = True
        bpy.data.objects[name].hide_viewport = True
    round_orbitals(bpy.data.objects['Shape_IndexedFaceSet.006'])
    arrow_vectors = {
        'anion_arrows': diagram_arrows(bpy.data.objects['Shape_IndexedFaceSet.001'],
                                       anion_sites, materials['anion_arrows'], 0.11),
    }
    if len(arrow_vectors['anion_arrows']) != 6:
        raise RuntimeError('Unexpected source arrow topology; inspect the scene before rendering.')
    add_rotation_rings([materials['inner_ring'], materials['outer_ring']])
    for obj in scene.objects:
        if obj.type == 'LIGHT':
            obj.hide_render = True

    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = args.samples
    scene.cycles.use_denoising = False
    scene.cycles.transparent_max_bounces = 16
    scene.render.resolution_x = args.width
    scene.render.resolution_y = round(args.width * 3 / 4)
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'
    scene.render.image_settings.color_depth = '8'
    scene.render.image_settings.compression = 90
    scene.render.use_compositing = False
    scene.render.use_sequencer = False
    for prop in scene.render.bl_rna.properties:
        if prop.identifier.startswith('use_stamp') and prop.type == 'BOOLEAN':
            setattr(scene.render, prop.identifier, False)
    scene.view_settings.view_transform = 'Standard'
    scene.view_settings.look = 'None'
    scene.view_settings.exposure = 0
    scene.view_settings.gamma = 1
    fit_camera(scene)

    after = {obj.name: geometry_digest(obj) for obj in meshes}
    if before != after:
        raise RuntimeError('Source geometry changed unexpectedly.')
    audit = {'source_base_geometry_unchanged': before == after,
             'source_meshes': before, 'roles': roles,
             'added_guides': '12 curves following the existing octahedron edges',
             'arrow_vectors': arrow_vectors,
             'arrow_shaft_radius': 0.11,
             'hidden_groups': ['eight corner atoms', 'eight corner displacement arrows'],
             'orbital_display_modifiers': ['Website rounding shape key: Laplacian smoothing (24 iterations, 0.65), normalized to each original lobe bounding box', 'Catmull-Clark subdivision: render level 2'],
             'rotation_rings': {'radii': [4.8, 5.6], 'axial_y': -4.95, 'direction_markers': 2},
             'octahedron_edge_radius': 0.04,
             'octahedron_face_opacity': 0.34,
             'octahedron_face_color': '#D5E6DE',
             'octahedron_face_relief': 0.14,
             'surface_finish': 'Satin orbital surfaces; glass-like facets and polished edges',
             'materials': {role: {'color': material['hero_color'],
                                  'opacity': round(material.diffuse_color[3], 3),
                                  'sheen': material['hero_sheen'],
                                  'highlight_power': material['hero_highlight_power']}
                           for role, material in materials.items()},
             'engine': 'Cycles CPU', 'projection': 'orthographic',
             'resolution': [scene.render.resolution_x, scene.render.resolution_y],
             'blender_version': bpy.app.version_string}
    if args.audit:
        Path(args.audit).write_text(json.dumps(audit, indent=2) + '\n')
    scene.render.filepath = str(Path(args.output).resolve())
    if args.save_blend:
        bpy.context.preferences.filepaths.save_version = 0
        bpy.ops.wm.save_as_mainfile(filepath=str(Path(args.save_blend).resolve()), compress=True)
    print('HERO_BASE_MESHES_PRESERVED: 7 source meshes; rounded orbital display; 6 thick arrows; 2 rings; outer groups hidden.')
    bpy.ops.render.render(write_still=True)
    # Drop PNG text metadata (including Blender's local filename) losslessly.
    output = Path(scene.render.filepath)
    png = output.read_bytes()
    clean = bytearray(png[:8])
    offset = 8
    while offset < len(png):
        length = struct.unpack('>I', png[offset:offset + 4])[0]
        chunk = png[offset:offset + length + 12]
        if png[offset + 4:offset + 8] not in (b'tEXt', b'iTXt', b'zTXt'):
            clean.extend(chunk)
        offset += length + 12
    output.write_bytes(clean)


main()
