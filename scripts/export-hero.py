"""Export a compact, satin-shaded GLB from website-hero.blend, without saving the scene.

blender --background --disable-autoexec artwork/hero/website-hero.blend \
  --python scripts/export-hero.py
"""
import json
import struct
from pathlib import Path

import bpy
from mathutils import Matrix, Vector


ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / 'public/assets/quantum-orbitals-ehu.glb'
scene = bpy.context.scene
camera = scene.camera
view_rotation = camera.matrix_world.to_3x3().transposed()
view_height = camera.data.ortho_scale * scene.render.resolution_y / scene.render.resolution_x
light_direction = Vector((0.6, 0.75, 0.85)).normalized()
highlight_direction = (light_direction + Vector((14, 2.7, 4.2)).normalized()).normalized()
visible = [obj for obj in scene.objects
           if obj.type in ('MESH', 'CURVE') and not obj.hide_render]
exports = []
audit = []


def web_material(source):
    name = source.name + ' · web'
    if name in bpy.data.materials:
        return bpy.data.materials[name]
    material = bpy.data.materials.new(name)
    if material.node_tree is None:
        material.use_nodes = True
    shader = material.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (1, 1, 1, 1)
    shader.inputs['Roughness'].default_value = 1
    shader.inputs['Alpha'].default_value = source.diffuse_color[3]
    material.diffuse_color = (1, 1, 1, source.diffuse_color[3])
    return material


for original in visible:
    source_material = original.data.materials[0]
    color = source_material.diffuse_color
    scale_node = next((node for node in source_material.node_tree.nodes
                       if node.type == 'MATH' and node.operation == 'MULTIPLY_ADD'), None)
    relief = scale_node.inputs[1].default_value if scale_node else 0
    sheen = source_material.get('hero_sheen', 0)
    highlight_power = source_material.get('hero_highlight_power', 18)
    # Work only on temporary copies. The input .blend and all original meshes stay intact.
    duplicate = original.copy()
    duplicate.data = original.data.copy()
    scene.collection.objects.link(duplicate)
    if duplicate.type == 'CURVE':
        duplicate.data.bevel_resolution = 1
    for modifier in duplicate.modifiers:
        if modifier.type == 'SUBSURF':
            modifier.levels = modifier.render_levels
    if original.name in ('Shape_IndexedFaceSet', 'Shape_IndexedFaceSet.003', 'Shape_IndexedFaceSet.006'):
        reduce = duplicate.modifiers.new('Web geometry reduction', 'DECIMATE')
        reduce.ratio = 0.035 if original.name != 'Shape_IndexedFaceSet.006' else 0.09
        reduce.use_collapse_triangulate = True
    bpy.context.view_layer.update()
    evaluated = duplicate.evaluated_get(bpy.context.evaluated_depsgraph_get())
    mesh = bpy.data.meshes.new_from_object(evaluated)
    # Bake the Blender form shading and restrained white highlight into linear
    # vertex colors. The illustrative finish needs no extra textures or lights.
    colors = mesh.color_attributes.new(name='Website color', type='FLOAT_COLOR', domain='CORNER')
    normal_matrix = original.matrix_world.to_3x3().inverted().transposed()
    for loop in mesh.loops:
        normal = (normal_matrix @ mesh.corner_normals[loop.index].vector).normalized()
        strength = 1 - relief + relief * normal.dot(light_direction)
        highlight = sheen * max(0, normal.dot(highlight_direction)) ** highlight_power
        colors.data[loop.index].color = (*[min(1, c * strength + highlight) for c in color[:3]], 1)
    # Store camera-facing coordinates: the browser's initial view matches the PNG.
    mesh.transform(view_rotation.to_4x4() @ original.matrix_world)
    mesh.materials.clear()
    mesh.materials.append(web_material(source_material))
    exported = bpy.data.objects.new(original.name + ' · web', mesh)
    scene.collection.objects.link(exported)
    exports.append(exported)
    audit.append({'source': original.name, 'vertices': len(mesh.vertices),
                  'triangles': sum(len(face.vertices) - 2 for face in mesh.polygons)})
    bpy.data.objects.remove(duplicate, do_unlink=True)

# Separate disconnected translucent lobes for correct per-surface depth sorting.
bpy.ops.object.select_all(action='DESELECT')
for obj in exports:
    obj.select_set(True)
bpy.context.view_layer.objects.active = exports[0]
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.separate(type='LOOSE')
bpy.ops.object.mode_set(mode='OBJECT')
# Mesh centers matter to Three.js's transparent-object sorting.
bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
bpy.ops.export_scene.gltf(
    filepath=str(OUTPUT), export_format='GLB', use_selection=True,
    export_yup=False, export_normals=False, export_texcoords=False,
    export_vertex_color='ACTIVE', export_all_vertex_colors=False,
    export_animations=False, export_morph=False, export_skins=False,
    export_cameras=False, export_lights=False, export_extras=False,
)

# Standard glTF unlit materials preserve the baked satin finish. No renderer-
# specific shader code or compressed-geometry decoder is needed in the browser.
data = OUTPUT.read_bytes()
json_size = struct.unpack_from('<I', data, 12)[0]
gltf = json.loads(data[20:20 + json_size])
binary_chunk = data[20 + json_size:]
gltf['extensionsUsed'] = sorted(set(gltf.get('extensionsUsed', []) + ['KHR_materials_unlit']))
for material in gltf['materials']:
    material.setdefault('extensions', {})['KHR_materials_unlit'] = {}
    material['doubleSided'] = True
    alpha = material.get('pbrMetallicRoughness', {}).get('baseColorFactor', [1, 1, 1, 1])[3]
    if alpha < 1:
        material['alphaMode'] = 'BLEND'
        material.pop('alphaCutoff', None)
gltf['scenes'][gltf.get('scene', 0)]['extras'] = {'heroViewHeight': view_height}
encoded = json.dumps(gltf, separators=(',', ':')).encode()
encoded += b' ' * (-len(encoded) % 4)
OUTPUT.write_bytes(struct.pack('<III', 0x46546C67, 2, 20 + len(encoded) + len(binary_chunk))
                   + struct.pack('<II', len(encoded), 0x4E4F534A) + encoded + binary_chunk)
report = {'source': 'artwork/hero/website-hero.blend', 'output': str(OUTPUT.relative_to(ROOT)),
          'bytes': OUTPUT.stat().st_size, 'triangles': sum(row['triangles'] for row in audit),
          'source_objects': audit, 'meshes': len(gltf['meshes']),
          'view_height': view_height, 'textures': 0,
          'shading': 'Baked linear vertex colors with satin surfaces and glass-like facets; KHR_materials_unlit',
          'hidden_source_groups_exported': False}
(ROOT / 'artwork/hero/web-export-audit.json').write_text(json.dumps(report, indent=2) + '\n')
print('HERO_WEB_EXPORT:', json.dumps(report))
