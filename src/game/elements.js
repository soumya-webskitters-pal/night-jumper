export function createElementFactory(THREE) {
  function material(color, roughness = 0.35, metalness = 0.4) {
    return new THREE.MeshStandardMaterial({ color, roughness, metalness });
  }

  function mesh(geometry, meshMaterial, cast = true, receive = true) {
    const object = new THREE.Mesh(geometry, meshMaterial);
    object.castShadow = cast;
    object.receiveShadow = receive;
    return object;
  }

  return { material, mesh };
}
