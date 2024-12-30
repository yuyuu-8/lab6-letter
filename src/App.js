// App.jsx
import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './App.css';

const App = () => {
  const canvasRef = useRef(null);
  const topViewRef = useRef(null);
  const frontViewRef = useRef(null);
  const sideViewRef = useRef(null);

  const [transformMatrix, setTransformMatrix] = useState([
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ]);

  const [scale, setScale] = useState({ x: 1, y: 1, z: 1 });
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    if (!canvasRef.current) return;

    // Основная сцена
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / 2 / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
    renderer.setSize(window.innerWidth / 2, window.innerHeight);

    // Координаты вершин
    const vertices = [
      // Верхняя часть
      new THREE.Vector3(-0.5, 2, 1),
      new THREE.Vector3(1, 2, 1),
      new THREE.Vector3(1, 2, -1),
      new THREE.Vector3(-0.5, 2, -1),
      new THREE.Vector3(-1, 2.5, 1),
      new THREE.Vector3(1, 2.5, 1),
      new THREE.Vector3(1, 2.5, -1),
      new THREE.Vector3(-1, 2.5, -1),
      // Средняя часть
      new THREE.Vector3(-0.5, 0.25, 1),
      new THREE.Vector3(1, 0.25, 1),
      new THREE.Vector3(1, 0.25, -1),
      new THREE.Vector3(-0.5, 0.25, -1),
      new THREE.Vector3(-1, -0.25, 1),
      new THREE.Vector3(0.5, -0.25, 1),
      new THREE.Vector3(0.5, -0.25, -1),
      new THREE.Vector3(-1, -0.25, -1),
      // Нижняя часть
      new THREE.Vector3(-1, -2, 1),
      new THREE.Vector3(0.5, -2, 1),
      new THREE.Vector3(0.5, -2, -1),
      new THREE.Vector3(-1, -2, -1),
      new THREE.Vector3(-1, -2.5, 1),
      new THREE.Vector3(1, -2.5, 1),
      new THREE.Vector3(1, -2.5, -1),
      new THREE.Vector3(-1, -2.5, -1),
    ];

    const geometry = new THREE.BufferGeometry();
    const positions = [];

    // Ребра буквы
    const edges = [
      // Upper part edges
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      // Middle part edges
      [8, 9], [9, 10], [10, 11], [11, 8],
      [12, 13], [13, 14], [14, 15], [15, 12],
      // Lower part edges
      [16, 17], [17, 18], [18, 19], [19, 16],
      [20, 21], [21, 22], [22, 23], [23, 20],
      // Connections between parts
      /*[0, 4], [1, 5], [2, 6], [3, 7],
      [8, 12], [9, 13], [10, 14], [11, 15],
      [16, 20], [17, 21], [18, 22], [19, 23],*/
      [16, 20], [19, 23], [13, 17], [14, 18],
      [4, 12], [7, 15], [9, 21], [10, 22],
      [0, 8], [3, 11], [1, 5], [2, 6],
    ];

    edges.forEach(edge => {
      positions.push(vertices[edge[0]].x, vertices[edge[0]].y, vertices[edge[0]].z);
      positions.push(vertices[edge[1]].x, vertices[edge[1]].y, vertices[edge[1]].z);
    });

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const material = new THREE.LineBasicMaterial({ color: 0xffffff });
    const letterS = new THREE.LineSegments(geometry, material);
    scene.add(letterS);

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);

    const controls = new OrbitControls(camera, renderer.domElement);

    if (topViewRef.current && frontViewRef.current && sideViewRef.current) {
      const setupOrthographicView = (canvas, cameraPosition) => {
        const orthScene = new THREE.Scene();
        const orthCamera = new THREE.OrthographicCamera(-5, 5, 5, -5, 0.1, 1000);
        const orthRenderer = new THREE.WebGLRenderer({ canvas });
        orthRenderer.setSize(200, 200);

        orthCamera.position.copy(cameraPosition);
        orthCamera.lookAt(0, 0, 0);

        const clonedLetterS = letterS.clone();
        orthScene.add(new THREE.AxesHelper(5));
        orthScene.add(clonedLetterS);

        return { scene: orthScene, camera: orthCamera, renderer: orthRenderer, object: clonedLetterS };
      };

      const topView = setupOrthographicView(topViewRef.current, new THREE.Vector3(0, 10, 0));
      const frontView = setupOrthographicView(frontViewRef.current, new THREE.Vector3(0, 0, 10));
      const sideView = setupOrthographicView(sideViewRef.current, new THREE.Vector3(10, 0, 0));

      const updateTransforms = () => {
        // Обновление трансформаций для основной сцены
        letterS.scale.set(scale.x, scale.y, scale.z);
        letterS.position.set(position.x, position.y, position.z);
        letterS.rotation.set(rotation.x, rotation.y, rotation.z);

        // Обновление трансформаций для проекций
        [topView, frontView, sideView].forEach(view => {
          view.object.scale.copy(letterS.scale);
          view.object.position.copy(letterS.position);
          view.object.rotation.copy(letterS.rotation);
        });
      };

      const animate = () => {
        requestAnimationFrame(animate);

        // Обновление проекций
        updateTransforms();

        renderer.render(scene, camera);
        topView.renderer.render(topView.scene, topView.camera);
        frontView.renderer.render(frontView.scene, frontView.camera);
        sideView.renderer.render(sideView.scene, sideView.camera);
      };

      animate();

      return () => {
        renderer.dispose();
        topView.renderer.dispose();
        frontView.renderer.dispose();
        sideView.renderer.dispose();
      };
    }
  }, [scale, position, rotation]);

  useEffect(() => {
    const matrix = new THREE.Matrix4();

    const scaleMatrix = new THREE.Matrix4().makeScale(scale.x, scale.y, scale.z);
    const rotationMatrixX = new THREE.Matrix4().makeRotationX(rotation.x);
    const rotationMatrixY = new THREE.Matrix4().makeRotationY(rotation.y);
    const rotationMatrixZ = new THREE.Matrix4().makeRotationZ(rotation.z);
    const translationMatrix = new THREE.Matrix4().makeTranslation(
      position.x,
      position.y,
      position.z
    );

    matrix
      .multiplyMatrices(translationMatrix, rotationMatrixZ)
      .multiply(rotationMatrixY)
      .multiply(rotationMatrixX)
      .multiply(scaleMatrix);

    const matrixArray = matrix.toArray();
    const formattedMatrix = [];
    for (let i = 0; i < 4; i++) {
      formattedMatrix.push(matrixArray.slice(i * 4, (i + 1) * 4));
    }
    setTransformMatrix(formattedMatrix);
  }, [scale, rotation, position]);

  return (
    <div className="app">
      <div className="main-view">
        <canvas ref={canvasRef} />
        <p>Main 3D View</p>
      </div>
      <div className="controls">
        <div className="transform-controls">
          <h3>Масштабирование</h3>
          <label>X:
            <input type="range" min="0.1" max="2" step="0.1" value={scale.x}
              onChange={(e) => setScale({ ...scale, x: parseFloat(e.target.value) })} />
          </label>
          <label>Y:
            <input type="range" min="0.1" max="2" step="0.1" value={scale.y}
              onChange={(e) => setScale({ ...scale, y: parseFloat(e.target.value) })} />
          </label>
          <label>Z:
            <input type="range" min="0.1" max="2" step="0.1" value={scale.z}
              onChange={(e) => setScale({ ...scale, z: parseFloat(e.target.value) })} />
          </label>

          <h3>Перенос</h3>
          <label>X:
            <input type="range" min="-5" max="5" step="0.1" value={position.x}
              onChange={(e) => setPosition({ ...position, x: parseFloat(e.target.value) })} />
          </label>
          <label>Y:
            <input type="range" min="-5" max="5" step="0.1" value={position.y}
              onChange={(e) => setPosition({ ...position, y: parseFloat(e.target.value) })} />
          </label>
          <label>Z:
            <input type="range" min="-5" max="5" step="0.1" value={position.z}
              onChange={(e) => setPosition({ ...position, z: parseFloat(e.target.value) })} />
          </label>

          <h3>Вращение</h3>
          <label>X:
            <input type="range" min="0" max={Math.PI * 2} step="0.1" value={rotation.x}
              onChange={(e) => setRotation({ ...rotation, x: parseFloat(e.target.value) })} />
          </label>
          <label>Y:
            <input type="range" min="0" max={Math.PI * 2} step="0.1" value={rotation.y}
              onChange={(e) => setRotation({ ...rotation, y: parseFloat(e.target.value) })} />
          </label>
          <label>Z:
            <input type="range" min="0" max={Math.PI * 2} step="0.1" value={rotation.z}
              onChange={(e) => setRotation({ ...rotation, z: parseFloat(e.target.value) })} />
          </label>
        </div>

        <div className="projections">
          <h3>Проекции</h3>
          <div className="projection-views">
            <div>
              <canvas ref={topViewRef} />
              <p>Top View (XY Plane)</p>
            </div>
            <div>
              <canvas ref={frontViewRef} />
              <p>Front View (XZ Plane)</p>
            </div>
            <div>
              <canvas ref={sideViewRef} />
              <p>Side View (YZ Plane)</p>
            </div>
          </div>
        </div>

        <div className="matrix">
          <h3>Матрица преобразования</h3>
          <div className="matrix-display">
            {transformMatrix.map((row, i) => (
              <div key={i}>
                {row.map((val, j) => (
                  <span key={j}>{val.toFixed(2)}</span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;