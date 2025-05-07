import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const Chart3D = ({ fileData, filename }) => {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  const [visualizationType, setVisualizationType] = useState('bar3d');
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [chartTitle, setChartTitle] = useState(`${filename} - 3D Visualization`);
  const [chartOptions, setChartOptions] = useState({
    baseColor: '#4F46E5',
    highlightColor: '#10B981',
    ambientLightIntensity: 0.5,
    directionalLightIntensity: 0.8,
  });

  // Initialize Three.js scene
  useEffect(() => {
    const initThree = async () => {
      // Import Three.js modules dynamically
      const THREE = await import('three');
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls');
      
      // Create scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf0f0f0);
      sceneRef.current = scene;
      
      // Create camera
      const camera = new THREE.PerspectiveCamera(
        75,
        mountRef.current.clientWidth / mountRef.current.clientHeight,
        0.1,
        1000
      );
      camera.position.set(15, 15, 15);
      cameraRef.current = camera;
      
      // Create renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      rendererRef.current = renderer;
      
      // Add renderer to DOM
      if (mountRef.current.childElementCount === 0) {
        mountRef.current.appendChild(renderer.domElement);
      }
      
      // Add lights
      const ambientLight = new THREE.AmbientLight(0xffffff, chartOptions.ambientLightIntensity);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, chartOptions.directionalLightIntensity);
      directionalLight.position.set(5, 10, 7);
      scene.add(directionalLight);
      
      // Add grid helper
      const gridHelper = new THREE.GridHelper(20, 20);
      scene.add(gridHelper);
      
      // Add axes helper
      const axesHelper = new THREE.AxesHelper(5);
      scene.add(axesHelper);
      
      // Add controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controlsRef.current = controls;
      
      // Animation loop
      const animate = () => {
        animationFrameRef.current = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      
      animate();
      
      // Handle window resize
      const handleResize = () => {
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      };
      
      window.addEventListener('resize', handleResize);
      
      // Cleanup function
      return () => {
        window.removeEventListener('resize', handleResize);
        
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        
        // Dispose of resources
        scene.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
        
        renderer.dispose();
        controls.dispose();
        
        // Remove renderer from DOM
        if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
          mountRef.current.removeChild(renderer.domElement);
        }
      };
    };
    
    initThree();
  }, [chartOptions.ambientLightIntensity, chartOptions.directionalLightIntensity]);

  // Extract column headers when fileData changes
  useEffect(() => {
    if (fileData && fileData.headers) {
      const numericColumns = fileData.headers.filter(header => {
        // Check if the column contains numeric data
        return fileData.data.some(row => {
          const value = row[header];
          return value !== null && value !== undefined && !isNaN(parseFloat(value));
        });
      });
      
      setAvailableColumns(numericColumns);
      
      // Auto-select up to three numeric columns by default if available
      if (numericColumns.length >= 3) {
        setSelectedColumns([numericColumns[0], numericColumns[1], numericColumns[2]]);
      } else if (numericColumns.length === 2) {
        setSelectedColumns([numericColumns[0], numericColumns[1]]);
      } else if (numericColumns.length === 1) {
        setSelectedColumns([numericColumns[0]]);
      }
    }
  }, [fileData]);

  // Create or update visualization when necessary
  useEffect(() => {
    if (!fileData || !fileData.data || selectedColumns.length === 0 || !sceneRef.current) {
      return;
    }
    
    const createVisualization = async () => {
      const THREE = await import('three');
      
      // Clear existing 3D objects (except lights, grid, and axes)
      sceneRef.current.children.forEach((object) => {
        if (
          !(object instanceof THREE.AmbientLight) &&
          !(object instanceof THREE.DirectionalLight) &&
          !(object instanceof THREE.GridHelper) &&
          !(object instanceof THREE.AxesHelper)
        ) {
          sceneRef.current.remove(object);
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
      
      // Add title text
      const createTextSprite = (message, position) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 128;
        
        context.font = '32px Arial';
        context.fillStyle = '#000000';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#ffffff';
        context.fillText(message, 10, 64);
        
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        sprite.position.set(...position);
        sprite.scale.set(10, 2.5, 1);
        
        return sprite;
      };
      
      // Add title
      const titleSprite = createTextSprite(chartTitle, [0, 12, 0]);
      sceneRef.current.add(titleSprite);

      // Prepare the data
      let maxValues = {
        x: 0,
        y: 0,
        z: 0,
      };

      const normalizedData = fileData.data.map((row, index) => {
        const x = selectedColumns[0] ? parseFloat(row[selectedColumns[0]]) || 0 : index * 0.5;
        const y = selectedColumns[1] ? parseFloat(row[selectedColumns[1]]) || 0 : 0;
        const z = selectedColumns[2] ? parseFloat(row[selectedColumns[2]]) || 0 : 0;
        
        maxValues.x = Math.max(maxValues.x, x);
        maxValues.y = Math.max(maxValues.y, y);
        maxValues.z = Math.max(maxValues.z, z);
        
        return { x, y, z };
      });
      
      // Scale factor to keep the visualization within bounds
      const scaleFactor = 10 / Math.max(maxValues.x, maxValues.y, maxValues.z, 1);

      // Create axis labels
      const createAxisLabel = (text, position) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        
        context.font = '24px Arial';
        context.fillStyle = 'rgba(255, 255, 255, 0)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#000000';
        context.fillText(text, 10, 32);
        
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        sprite.position.set(...position);
        sprite.scale.set(5, 1.5, 1);
        
        return sprite;
      };
      
      // Add axis labels
      if (selectedColumns[0]) {
        const xLabel = createAxisLabel(selectedColumns[0], [6, 0, 0]);
        sceneRef.current.add(xLabel);
      }
      
      if (selectedColumns[1]) {
        const yLabel = createAxisLabel(selectedColumns[1], [0, 6, 0]);
        sceneRef.current.add(yLabel);
      }
      
      if (selectedColumns[2]) {
        const zLabel = createAxisLabel(selectedColumns[2], [0, 0, 6]);
        sceneRef.current.add(zLabel);
      }

      // Create visualization based on type
      if (visualizationType === 'bar3d') {
        // 3D bar chart
        normalizedData.forEach((point, index) => {
          const geometry = new THREE.BoxGeometry(
            0.5,
            point.y * scaleFactor || 0.1,
            0.5
          );
          
          const material = new THREE.MeshPhongMaterial({
            color: new THREE.Color(chartOptions.baseColor),
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x111111),
            shininess: 30,
          });
          
          const bar = new THREE.Mesh(geometry, material);
          
          // Position the bar
          bar.position.x = point.x * scaleFactor;
          bar.position.y = (point.y * scaleFactor) / 2;
          bar.position.z = point.z * scaleFactor || (index % 10) * 0.6;
          
          // Add hover event
          bar.userData = {
            originalColor: chartOptions.baseColor,
            highlightColor: chartOptions.highlightColor,
            value: point.y,
            name: fileData.data[index][selectedColumns[0]] || index,
          };
          
          sceneRef.current.add(bar);
        });
      } else if (visualizationType === 'scatter3d') {
        // 3D scatter plot
        normalizedData.forEach((point) => {
          const geometry = new THREE.SphereGeometry(0.2, 32, 32);
          const material = new THREE.MeshPhongMaterial({
            color: new THREE.Color(chartOptions.baseColor),
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x111111),
            shininess: 30,
          });
          
          const sphere = new THREE.Mesh(geometry, material);
          
          // Position the sphere
          sphere.position.x = point.x * scaleFactor;
          sphere.position.y = point.y * scaleFactor;
          sphere.position.z = point.z * scaleFactor;
          
          // Add hover event
          sphere.userData = {
            originalColor: chartOptions.baseColor,
            highlightColor: chartOptions.highlightColor,
            valueX: point.x,
            valueY: point.y,
            valueZ: point.z,
          };
          
          sceneRef.current.add(sphere);
        });
      } else if (visualizationType === 'surface3d') {
        // 3D surface plot
        const xValues = [...new Set(normalizedData.map((point) => point.x))].sort((a, b) => a - b);
        const zValues = [...new Set(normalizedData.map((point) => point.z))].sort((a, b) => a - b);
        
        const xSize = xValues.length || 10;
        const zSize = zValues.length || 10;
        
        // Create a grid
        const gridSize = Math.max(xSize, zSize);
        const geometry = new THREE.PlaneGeometry(10, 10, gridSize - 1, gridSize - 1);
        geometry.rotateX(-Math.PI / 2);
        
        const vertices = geometry.attributes.position.array;
        
        // Update vertex heights
        for (let i = 0; i < gridSize; i++) {
          for (let j = 0; j < gridSize; j++) {
            const index = (i * gridSize + j) * 3 + 1; // Y-coordinate index
            
            const x = (i / (gridSize - 1)) * 10 - 5;
            const z = (j / (gridSize - 1)) * 10 - 5;
            
            // Find closest data point
            let closestPoint = normalizedData[0];
            let minDistance = Infinity;
            
            normalizedData.forEach((point) => {
              const distance = Math.sqrt(
                Math.pow(point.x * scaleFactor - (x + 5), 2) +
                Math.pow(point.z * scaleFactor - (z + 5), 2)
              );
              
              if (distance < minDistance) {
                minDistance = distance;
                closestPoint = point;
              }
            });
            
            // Set vertex height
            vertices[index] = closestPoint.y * scaleFactor;
          }
        }
        
        // Update geometry
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
        
        // Create material
        const material = new THREE.MeshPhongMaterial({
          color: new THREE.Color(chartOptions.baseColor),
          side: THREE.DoubleSide,
          flatShading: false,
          wireframe: false,
        });
        
        // Create mesh
        const surface = new THREE.Mesh(geometry, material);
        surface.position.set(0, 0, 0);
        sceneRef.current.add(surface);
      }
      
      // Add raycaster for hover effects
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      
      const onMouseMove = (event) => {
        // Calculate mouse position in normalized device coordinates
        const rect = rendererRef.current.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, cameraRef.current);
        
        // Calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObjects(
          sceneRef.current.children.filter((obj) => obj.isMesh && !(obj instanceof THREE.GridHelper))
        );
        
        // Reset all object colors
        sceneRef.current.children.forEach((object) => {
          if (object.isMesh && object.userData && object.userData.originalColor) {
            object.material.color.set(object.userData.originalColor);
          }
        });
        
        // Highlight the first intersected object
        if (intersects.length > 0) {
          const object = intersects[0].object;
          if (object.userData && object.userData.highlightColor) {
            object.material.color.set(object.userData.highlightColor);
          }
        }
      };
      
      rendererRef.current.domElement.addEventListener('mousemove', onMouseMove);
      
      // Cleanup function
      return () => {
        rendererRef.current.domElement.removeEventListener('mousemove', onMouseMove);
      };
    };
    
    createVisualization();
  }, [fileData, selectedColumns, visualizationType, chartTitle, chartOptions.baseColor, chartOptions.highlightColor]);

  const handleColumnSelect = (column) => {
    if (selectedColumns.includes(column)) {
      setSelectedColumns(selectedColumns.filter((col) => col !== column));
    } else {
      setSelectedColumns([...selectedColumns, column].slice(0, 3));
    }
  };

  const downloadVisualization = async (format) => {
    if (!rendererRef.current) return;
    
    if (format === 'png') {
      // Render and download as PNG
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      const dataURL = rendererRef.current.domElement.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.download = `${chartTitle}.png`;
      link.href = dataURL;
      link.click();
    } else if (format === 'pdf') {
      // Download as PDF using jsPDF
      try {
        const jsPDF = (await import('jspdf')).default;
        const pdf = new jsPDF('landscape', 'mm', 'a4');
        
        // Add title
        pdf.setFontSize(16);
        pdf.text(chartTitle, 20, 20);
        
        // Render and add image
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        const dataURL = rendererRef.current.domElement.toDataURL('image/png');
        pdf.addImage(dataURL, 'PNG', 20, 30, 250, 150);
        
        // Save PDF
        pdf.save(`${chartTitle}.pdf`);
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Visualization type selection */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">3D Visualization Type</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'bar3d', name: '3D Bar Chart' },
            { id: 'scatter3d', name: '3D Scatter Plot' },
            { id: 'surface3d', name: '3D Surface' },
          ].map((type) => (
            <button
              key={type.id}
              className={`px-4 py-2 rounded-md text-sm ${
                visualizationType === type.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              onClick={() => setVisualizationType(type.id)}
            >
              {type.name}
            </button>
          ))}
        </div>
      </div>

      {/* Column selection */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">
          Select Columns (max 3: X, Y, Z axes)
        </h3>
        <div className="flex flex-wrap gap-2">
          {availableColumns.map((column, index) => (
            <button
              key={column}
              className={`px-3 py-1 rounded-md text-xs ${
                selectedColumns.includes(column)
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              onClick={() => handleColumnSelect(column)}
            >
              {column}
              {selectedColumns.includes(column) && (
                <span className="ml-1">
                  ({selectedColumns.indexOf(column) === 0
                    ? 'X'
                    : selectedColumns.indexOf(column) === 1
                    ? 'Y'
                    : 'Z'})
                </span>
              )}
            </button>
          ))}
        </div>
        {availableColumns.length === 0 && (
          <p className="text-sm text-red-500">
            No numeric columns found in the data.
          </p>
        )}
      </div>

      {/* Visualization title */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Visualization Title</h3>
        <input
          type="text"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={chartTitle}
          onChange={(e) => setChartTitle(e.target.value)}
        />
      </div>

      {/* Color customization */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Colors</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Base Color</label>
            <input
              type="color"
              className="w-full h-8 rounded cursor-pointer border border-gray-300"
              value={chartOptions.baseColor}
              onChange={(e) =>
                setChartOptions({ ...chartOptions, baseColor: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Highlight Color</label>
            <input
              type="color"
              className="w-full h-8 rounded cursor-pointer border border-gray-300"
              value={chartOptions.highlightColor}
              onChange={(e) =>
                setChartOptions({ ...chartOptions, highlightColor: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* Light settings */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Lighting</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Ambient Light: {chartOptions.ambientLightIntensity.toFixed(1)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              className="w-full"
              value={chartOptions.ambientLightIntensity}
              onChange={(e) =>
                setChartOptions({
                  ...chartOptions,
                  ambientLightIntensity: parseFloat(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Directional Light: {chartOptions.directionalLightIntensity.toFixed(1)}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              className="w-full"
              value={chartOptions.directionalLightIntensity}
              onChange={(e) =>
                setChartOptions({
                  ...chartOptions,
                  directionalLightIntensity: parseFloat(e.target.value),
                })
              }
            />
          </div>
        </div>
      </div>

      {/* 3D Visualization container */}
      <div
        ref={mountRef}
        className="w-full h-[500px] bg-gray-100 rounded-lg border border-gray-200"
      ></div>

      {/* Instructions */}
      <div className="text-sm text-gray-500">
        <p>Drag to rotate | Scroll to zoom | Right-click and drag to pan</p>
      </div>

      {/* Download options */}
      <div className="flex space-x-4">
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          onClick={() => downloadVisualization('png')}
        >
          Download as PNG
        </button>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          onClick={() => downloadVisualization('pdf')}
        >
          Download as PDF
        </button>
      </div>
    </div>
  );
};

Chart3D.propTypes = {
  fileData: PropTypes.shape({
    headers: PropTypes.array.isRequired,
    data: PropTypes.array.isRequired,
  }).isRequired,
  filename: PropTypes.string.isRequired,
};

export default Chart3D; 