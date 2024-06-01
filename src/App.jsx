import "./App.css";
import { useState } from "react";

export default function App() {
  const [cpuTemp, setCpuTemp] = useState(0);
  const [gpuTemp, setGpuTemp] = useState(0);
  const [ramUsage, setRamUsage] = useState(20);
  window.nzxt = {
    v1: {
      onMonitoringDataUpdate: (data) => {
        const { cpus, gpus, ram, kraken } = data;
        if (cpus) {
          setCpuTemp(Math.round(cpus[0].temperature));
        }
        if (gpus) {
          setGpuTemp(Math.round(gpus[1].temperature));
        }
        if(ram) {
          setRamUsage(Math.round((ram.inUse / ram.totalSize * 100)));
        }
      }
    }
  };
  return (
    <>
      <div className="flex justify-center items-center h-screen">
        <div className="justify-center items-center z-40">
          <div className="text-8xl flex">
            <p className="px-6">
              <p className="text-5xl text-center">
                CPU
              </p>
              {cpuTemp}°C
            </p>
            <p className="px-6">
              <p className="text-5xl text-center">
                GPU
              </p>
              {gpuTemp}°C
            </p>
          </div>
        </div>
      </div>
      <div className="fixed w-[100%] z-0" style={{top: 100-ramUsage + "%"}}>
        <svg className="waves" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 24 150 20" preserveAspectRatio="none" shapeRendering="auto">
            <defs>
                <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
            </defs>
            <g class="parallax">
                <use xlinkHref="#gentle-wave" x="48" y="0" fill="rgba(0, 150, 150,0.7" />
                <use xlinkHref="#gentle-wave" x="48" y="-3" fill="rgba(0, 150, 200,0.5)" />
                <use xlinkHref="#gentle-wave" x="48" y="-5" fill="rgba(0, 177, 250,0.3)" />
                <use xlinkHref="#gentle-wave" x="48" y="5" fill="#00b1c5" />
            </g>
        </svg>
      </div>
      <div className="fixed w-[100%] h-[100%] bg-[#00b1c5]" style={{top: 100-ramUsage+6.3 + "%"}}>
      </div>
    </>
  );
}
