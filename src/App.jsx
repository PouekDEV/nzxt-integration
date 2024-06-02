import "./App.css";
import { useState, useEffect } from "react";

export default function App() {
  const [cpuTemp, setCpuTemp] = useState(0);
  const [gpuTemp, setGpuTemp] = useState(0);
  const [ramUsage, setRamUsage] = useState(0);
  const [kraken, setKraken] = useState(0);
  const [showCpu, setShowCpu] = useState(true);
  const [showGpu, setShowGpu] = useState(true);
  const [showClock, setShowClock] = useState(false);
  const [showWater, setShowWater] = useState(true);
  const [waterColor, setWaterColor] = useState("#00b1c5");
  const [backgroundColor, setBackgroundColor] = useState("#000000");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("");
  const [textColor, setTextColor] = useState("#ffffff");

  setInterval(function getCurrentTime() {
    if(showClock){
      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-US', { hour12: false });
      document.getElementById('time').innerHTML = currentTime;
    }
  },1000)

  function changeWaterColor(value) {
    setWaterColor(value);
    localStorage.setItem('waterColor', JSON.stringify(value));
  }

  function changeBackgroundColor(value) {
    setBackgroundColor(value);
    localStorage.setItem('backgroundColor', JSON.stringify(value));
  }

  function changeCpuVisibility() {
    setShowCpu(!showCpu);
    localStorage.setItem('showCpu', JSON.stringify(!showCpu));
  }

  function changeGpuVisibility() {
    setShowGpu(!showGpu);
    localStorage.setItem('showGpu', JSON.stringify(!showGpu));
  }

  function changeClockVisibility() {
    setShowClock(!showClock);
    localStorage.setItem('showClock', JSON.stringify(!showClock));
  }

  function changeBackgroundImageUrl(value) {
    setBackgroundImageUrl(value);
    localStorage.setItem('backgroundImageUrl', JSON.stringify(value));
  }

  function changeWaterVisibility(){
    setShowWater(!showWater);
    localStorage.setItem('showWater', JSON.stringify(!showWater));
  }

  function changeTextColor(value) {
    setTextColor(value);
    localStorage.setItem('textColor', JSON.stringify(value));
  }

  function hexToRgba(level) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(waterColor);
    if(result){
      return "rgba(" + parseInt(result[1], 16) + "," + (parseInt(result[2], 16) - level*20) + "," + (parseInt(result[3], 16) - level*20) + "," + (0.7 - level/10) + ")";
    }
    else{
      return null;
    }
  }

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setKraken(searchParams.get("kraken"));
  }, []);

  window.nzxt = {
    v1: {
      onMonitoringDataUpdate: (data) => {
        const { cpus, gpus, ram } = data;
        if (cpus) {
          setCpuTemp(Math.round(cpus[0].temperature));
        }
        if (gpus) {
          setGpuTemp(Math.round(gpus[1].temperature));
        }
        if(ram) {
          setRamUsage(Math.round((ram.inUse / ram.totalSize * 100)));
        }
        const savedWaterColor = localStorage.getItem('waterColor');
        if (savedWaterColor) {
          setWaterColor(JSON.parse(savedWaterColor));
        }
        const savedShowCpu = localStorage.getItem('showCpu');
        if (savedShowCpu) {
          setShowCpu(JSON.parse(savedShowCpu));
        }
        const savedShowGpu = localStorage.getItem('showGpu');
        if (savedShowGpu) {
          setShowGpu(JSON.parse(savedShowGpu));
        }
        const savedShowClock = localStorage.getItem('showClock');
        if (savedShowClock) {
          setShowClock(JSON.parse(savedShowClock));
        }
        const savedBackgroundColor = localStorage.getItem('backgroundColor');
        if (savedBackgroundColor) {
          setBackgroundColor(JSON.parse(savedBackgroundColor));
        }
        const savedBackgroundImageUrl = localStorage.getItem('backgroundImageUrl');
        if (savedBackgroundImageUrl) {
          setBackgroundImageUrl(JSON.parse(savedBackgroundImageUrl));
        }
        const savedShowWater = localStorage.getItem('showWater');
        if (savedShowWater) {
          setShowWater(JSON.parse(savedShowWater));
        }
        const savedTextColor = localStorage.getItem('textColor');
        if (savedTextColor) {
          setTextColor(JSON.parse(savedTextColor));
        }
      }
    }
  };

  return (
    <>
      {kraken != null ?
        <>
          <div className="flex justify-center items-center h-screen bg-no-repeat bg-cover bg-center" style={{backgroundColor: backgroundColor, backgroundImage: "url('"+backgroundImageUrl+"')", color: textColor}}>
            <div className="justify-center items-center z-40">
              {showClock &&
                <p className="text-5xl text-center mb-12" id="time"></p>
              }
              <div className="text-8xl flex my-12">
                {showCpu &&
                  <span className="px-6">
                    <p className="text-5xl text-center">
                      CPU
                    </p>
                    {cpuTemp}°C
                  </span>
                }
                {showGpu &&
                  <span className="px-6">
                    <p className="text-5xl text-center">
                      GPU
                    </p>
                    {gpuTemp}°C
                  </span>
                }
              </div>
            </div>
          </div>
          {showWater &&
            <>
              <div className="fixed w-[100%] z-0" style={{top: 100-ramUsage + "%"}}>
                <svg className="waves" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
                    viewBox="0 24 150 20" preserveAspectRatio="none" shapeRendering="auto">
                    <defs>
                        <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
                    </defs>
                    <g className="parallax">
                        <use xlinkHref="#gentle-wave" x="48" y="0" fill={hexToRgba(0)} />
                        <use xlinkHref="#gentle-wave" x="48" y="-3" fill={hexToRgba(1)} />
                        <use xlinkHref="#gentle-wave" x="48" y="-5" fill={hexToRgba(2)} />
                        <use xlinkHref="#gentle-wave" x="48" y="5" fill={waterColor} />
                    </g>
                </svg>
              </div>
              <div className="fixed w-[100%] h-[100%]" style={{top: 100-ramUsage+6.3 + "%", backgroundColor: waterColor}}></div>
            </>
          }
        </>
      : 
        <div className="text-xl">
          <div>
            <span className="mx-5">Change water color</span>
            <input className="bg-black mx-5" type="color" value={waterColor} onChange={(e) => changeWaterColor(e.target.value)}/>
            <button onClick={() => changeWaterColor("#00b1c5")}>Default</button>
          </div>
          <div>
            <span className="mx-5">Change background color</span>
            <input className="bg-black mx-5" type="color" value={backgroundColor} onChange={(e) => changeBackgroundColor(e.target.value)}/>
            <button onClick={() => changeBackgroundColor("#000000")}>Default</button>
          </div>
          <div>
            <span className="mx-5">Change text color</span>
            <input className="bg-black mx-5" type="color" value={textColor} onChange={(e) => changeTextColor(e.target.value)}/>
            <button onClick={() => changeTextColor("#FFFFFF")}>Default</button>
          </div>
          <div>
            <span className="mx-5">Set background image URL</span>
            <input className="mx-5 text-black" type="text" value={backgroundImageUrl} onChange={(e) => changeBackgroundImageUrl(e.target.value)}/>
          </div>
          <div>
            <span className="mx-5">Show CPU</span>
            <input type="checkbox" checked={showCpu} onChange={() => changeCpuVisibility()}/>
          </div>
          <div>
            <span className="mx-5">Show GPU</span>
            <input type="checkbox" checked={showGpu} onChange={() => changeGpuVisibility()}/>
          </div>
          <div>
            <span className="mx-5">Show Clock</span>
            <input type="checkbox" checked={showClock} onChange={() => changeClockVisibility()}/>
          </div>
          <div>
            <span className="mx-5">Show Water</span>
            <input type="checkbox" checked={showWater} onChange={() => changeWaterVisibility()}/>
          </div>
        </div>
      }
    </>
  );
}
