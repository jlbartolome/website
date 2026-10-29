// Validate the actual exported asset with the same loader used in the browser.
// This checks geometry/material integrity, not WebGL rendering or UI behavior.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Box3, DoubleSide, Mesh, MeshBasicMaterial, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export async function verifyHeroModel(file) {
  const bytes = await readFile(file);
  assert.equal(bytes.readUInt32LE(0), 0x46546c67, 'Hero must be a GLB file');
  assert.equal(bytes.readUInt32LE(4), 2, 'Expected glTF 2');
  assert.equal(bytes.readUInt32LE(8), bytes.length, 'Truncated GLB');
  assert(bytes.length < 1_500_000, 'Hero exceeds the 1.5 MB model budget');
  const json = JSON.parse(bytes.toString('utf8', 20, 20 + bytes.readUInt32LE(12)));
  assert(!json.images?.length && !json.animations?.length && !json.cameras?.length,
    'Hero must not introduce external images, animation or cameras');
  assert(!json.buffers.some((buffer) => buffer.uri), 'Hero geometry must be self-contained');
  const names = json.nodes.map((node) => node.name || '');
  const count = (prefix) => names.filter((name) => name.startsWith(prefix)).length;
  assert.equal(count('Octahedron edge guides'), 12, 'Keep all twelve cage edges');
  assert.equal(count('Rotation ring '), 2, 'Keep both rotation rings');
  assert.equal(count('Rotation direction '), 2, 'Keep both ring arrowheads');
  assert.equal(count('Shape_IndexedFaceSet.001 · diagram head'), 6, 'Keep six displacement arrowheads');
  assert.equal(count('Shape_IndexedFaceSet.001 · diagram shaft'), 6, 'Keep six displacement shafts');
  assert.equal(count('Shape_IndexedFaceSet.003 · web'), 6, 'Keep six octahedral sites');
  assert.equal(count('Shape_IndexedFaceSet.006 · web'), 14, 'Keep all source orbital components');
  assert(!names.some((name) => /^Shape_IndexedFaceSet\.00[24]/.test(name)), 'Outer groups must remain hidden');

  const gltf = await new GLTFLoader().parseAsync(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '',
  );
  assert(gltf.scene.userData.heroViewHeight > 0, 'Missing initial camera framing');
  let triangles = 0;
  let octahedronFaces = 0;
  const opacity = new Map();
  gltf.scene.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const { geometry, material } = object;
    const positions = geometry.getAttribute('position');
    assert(positions.count > 0 && positions.array.every(Number.isFinite), 'Invalid mesh coordinates');
    assert(geometry.getAttribute('color'), 'Missing baked surface colors');
    assert(material instanceof MeshBasicMaterial && material.vertexColors, 'Keep unlit vertex-color materials');
    assert(!material.map, 'No texture fetches should be needed');
    triangles += geometry.index.count / 3;
    if (material.name === 'EHU · octahedral faces · web') {
      octahedronFaces += geometry.index.count / 3;
      assert(material.transparent && material.side === DoubleSide, 'Octahedral faces must be translucent from both sides');
    }
    opacity.set(material.name, material.opacity);
    geometry.dispose();
  });
  assert.equal(octahedronFaces, 8, 'Keep all eight triangular octahedral faces');
  assert(Math.abs(opacity.get('EHU · octahedral faces · web') - 0.34) < 0.001, 'Preserve cage transparency');
  assert(Math.abs(opacity.get('EHU · orbital surface · web') - 0.88) < 0.001, 'Preserve lobe transparency');
  const size = new Box3().setFromObject(gltf.scene, true).getSize(new Vector3());
  assert(size.x > 10 && size.y > 10 && size.z > 10, 'The hero must have genuine 3D geometry');
  assert(triangles > 10_000 && triangles < 100_000, 'Unexpected geometry density');
  return `${triangles.toLocaleString('en')} triangles; ${(bytes.length / 1_000_000).toFixed(2)} MB GLB`;
}
