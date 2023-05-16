import React, { useState, useRef } from 'react';
import { SketchPicker } from 'react-color';
import Draggable from 'react-draggable';

const FileUploader = () => {
  const [buttonColor, setButtonColor] = useState('#3B82F6'); // Default color for Tailwind's indigo-500
  const [showColorPicker, setShowColorPicker] = useState(false); // Track the visibility of the color picker
  const [showAdminDropdown, setShowAdminDropdown] = useState(false); // Track the visibility of the admin dropdown

  const [results, setResults] = useState('');
  const [progress, setProgress] = useState(0);
  const [imageLink, setImageLink] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [bgImageLink, setBgImageLink] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const bgFileChooserRef = useRef();
  const fileChooserRef = useRef(null);

  const handleColorChange = (color) => {
    setButtonColor(color.hex);
  };
  
  const handleUrlInputChange = (event) => {
    setUrlInput(event.target.value);
  };
  
  const handleUploadClick = async () => {
    setResults('');
    setProgress(0);
  
    let file;
    if (urlInput) {
      try {
        const response = await fetch(urlInput);
        const blob = await response.blob();
        file = new File([blob], 'file', { type: blob.type });
      } catch (error) {
        setResults('Error: ' + error.message);
        setProgress(0);
        return;
      }
    } else {
      file = selectedFile;
      if (!file) {
        setResults('Nothing to upload.');
        return;
      }
    }
  
    const formData = new FormData();
    formData.append('file', file);
  
    // Create a new XMLHttpRequest
    var xhr = new XMLHttpRequest();
  
    // Configure it: POST-request for the URL /upload
    xhr.open('POST', 'http://localhost:3001/upload', true);
  
    // Listen to events
    xhr.upload.onprogress = function(event) {
      if (event.lengthComputable) {
        const percentage = Math.round((event.loaded / event.total) * 100);
        setProgress(percentage);
      }
    }
  
    xhr.onerror = function(error) {
      setResults('Error: ' + error.message);
      setProgress(0);
    };
  
    xhr.onload = function() {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.response);
        setImageLink(response.url);
        setResults('Success');
      } else {
        setResults('Error: ' + xhr.statusText);
        setProgress(0);
      }
    };
  
    // Send the request
    xhr.send(formData);
  };
  
  const handleUploadBackgroundClick = () => {
    bgFileChooserRef.current.click();
  };

  const handleBgFileChange = async (event) => {
    setResults('');
    setProgress(0);
  
    const file = event.target.files[0];
    
    if (!file) {
      setResults('No file selected.');
      return;
    }
  
    if (file.type !== 'image/gif') {
      setResults('Please select a GIF file.');
      return;
    }
  
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const response = await fetch('http://localhost:3001/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setBgImageLink(data.url);
      setResults('Background upload successful');
    } catch (error) {
      setResults('Error: ' + error.message);
      setProgress(0);
    }    
  };

  const handleFileChange = (event) => {
    setResults('');
    setProgress(0);
  
    const file = event.target.files[0];
  
    if (!file) {
      setResults('No file selected.');
      return;
    }
  
    setSelectedFile(file);
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen" style={{ backgroundImage: `url(${bgImageLink})` }}>
    <input type="file" ref={bgFileChooserRef} style={{ display: 'none' }} onChange={handleBgFileChange} />
    <div className="flex flex-col items-start justify-start rounded-lg shadow p-8 absolute top-0 left-0">
      <div className="relative">
        <button onClick={() => {
          setShowAdminDropdown(!showAdminDropdown);
          setShowColorPicker(false); // Close the color picker
        }} className="px-4 py-2 text-white rounded-lg hover:bg-indigo-600 transition-all" style={{ backgroundColor: buttonColor }}>Admin Stuff</button>
        {showAdminDropdown && (
          <div className="absolute left-0 mt-2">
            <button onClick={handleUploadBackgroundClick} className="px-4 py-2 text-white rounded-lg hover:bg-indigo-600 transition-all" style={{ backgroundColor: buttonColor }}>Upload Background</button>
            <button onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowAdminDropdown(false); // Close the admin dropdown
            }} className="px-4 py-2 text-white rounded-lg hover:bg-indigo-600 transition-all mt-2" style={{ backgroundColor: buttonColor }}>Change Color</button>
          </div>
        )}
      </div>
      {showColorPicker && (
        <Draggable>
          <div>
            <SketchPicker color={buttonColor} onChangeComplete={handleColorChange} className="absolute left-0 mt-8" />
          </div>
        </Draggable>
      )}
    </div>
    <div className="flex flex-col items-center justify-center mt-8">
      <div className="flex flex-col items-center justify-center mb-8">
        <input type="file" id="file-chooser" className="hidden" ref={fileChooserRef} onChange={handleFileChange} />
        <label htmlFor="file-chooser" className="px-4 py-2 text-white rounded-lg cursor-pointer hover:bg-indigo-600 transition-all" style={{ backgroundColor: buttonColor }}>Choose File</label>
        <div className="mt-2">
          <input type="text" placeholder="Enter URL" className="px-4 py-2 w-80 border border-gray-300 rounded-lg" value={urlInput} onChange={handleUrlInputChange} />
        </div>
      </div>
      <button onClick={handleUploadClick} className="px-4 py-2 text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-all" style={{ backgroundColor: buttonColor }}>Upload</button>
      <div className="relative w-full mt-8">
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-300">
          <div style={{ width: `${progress}%` }} className={`shadow-none flex flex-col text-center whitespace-nowrap justify-center transition-all 
            ${progress < 25 ? 'bg-red-500' :
            progress < 50 ? 'bg-yellow-500' :
            progress < 75 ? 'bg-green-500' :
            'bg-blue-500'
            }`}
          ></div>
        </div>
        <div id="results" className="mb-4">{results}</div>
      </div>
        {imageLink && (
          <a href={imageLink} target="_blank" rel="noreferrer" className="mt-4 text-red-500 hover:text-red-700">
            {imageLink}
          </a>
        )}
        {imageLink && (
          <img className="mt-4" src={imageLink} alt="" />        
        )}
      </div>
    </div>
  );
}  

export default FileUploader;