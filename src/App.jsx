import "./App.css";
import { useState, useEffect } from "react";

export default function App(){
    const [cpuTemp, setCpuTemp] = useState(0);
    const [gpuTemp, setGpuTemp] = useState(0);
    const [ramUsage, setRamUsage] = useState(0);
    const [kraken, setKraken] = useState(0);
    const [showCpu, setShowCpu] = useState(true);
    const [showGpu, setShowGpu] = useState(true);
    const [showWater, setShowWater] = useState(true);
    const [showWaterSpotify, setShowWaterSpotify] = useState(false);
    const [waterColor, setWaterColor] = useState("#00b1c5");
    const [backgroundColor, setBackgroundColor] = useState("#000000");
    const [backgroundImageUrl, setBackgroundImageUrl] = useState("");
    const [spotifyCover, setSpotifyCover] = useState("");
    const [textColor, setTextColor] = useState("#ffffff");
    const [spotifyClientId, setSpotifyClientId] = useState(localStorage.getItem('spotifyClientId'));
    const [spotifyClientSecret, setSpotifyClientSecret] = useState(localStorage.getItem('spotifyClientSecret'));
    const [spotifyRefreshToken, setSpotifyRefreshToken] = useState(localStorage.getItem('spotifyRefreshToken'));
    const [spotifyProgress, setSpotifyProgress] = useState(0);
    const [spotifyProgressEstimated, setSpotifyProgressEstimated] = useState(0);
    const [spotifyProgressOffset, setSpotifyProgressOffset] = useState(0);
    const [spotifyDuration, setSpotifyDuration] = useState(0);
    const [spotifyTitle, setSpotifyTitle] = useState("");
    const [spotifyArtists, setSpotifyArtists] = useState("");

    const CURRENTLY_PLAYING_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing";
    const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";

    //https://accounts.spotify.com/authorize?client_id=<client_id>&response_type=code&redirect_uri=<redirect_uri>&scope=user-read-currently-playing
    //curl -H "Authorization: Basic YOUR_ENCODED_STRING" -d grant_type=authorization_code -d code=YOUR_CODE -d redirect_uri=http://localhost:3000 https://accounts.spotify.com/api/token 

    async function getAccessToken(){
        const basic = btoa(`${spotifyClientId}:${spotifyClientSecret}`).toString("base64");
        const body = new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: spotifyRefreshToken,
        });
        const response = await fetch(TOKEN_ENDPOINT, {
            method: "POST",
            headers: {
                Authorization: `Basic ${basic}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: body.toString(),
        });
        return response.json().then((x) => x?.access_token);
    }

    async function getCurrentlyPlaying(){
        const accessToken = await getAccessToken();
        return fetch(CURRENTLY_PLAYING_ENDPOINT, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }).then(async (x) => {
            if(x.status !== 200){
                return null;
            }
            else{
                const data = await x.json();
                if (data.currently_playing_type !== "track" || !data.is_playing) return null;
                else return data;
            }
        });
    }

    function changeWaterColor(value){
        setWaterColor(value);
        localStorage.setItem('waterColor', JSON.stringify(value));
    }

    function changeBackgroundColor(value){
        setBackgroundColor(value);
        localStorage.setItem('backgroundColor', JSON.stringify(value));
    }

    function changeCpuVisibility(){
        setShowCpu(!showCpu);
        localStorage.setItem('showCpu', JSON.stringify(!showCpu));
    }

    function changeGpuVisibility(){
        setShowGpu(!showGpu);
        localStorage.setItem('showGpu', JSON.stringify(!showGpu));
    }

    function changeBackgroundImageUrl(value){
        setBackgroundImageUrl(value);
        localStorage.setItem('backgroundImageUrl', JSON.stringify(value));
    }

    function changeWaterVisibility(){
        setShowWater(!showWater);
        localStorage.setItem('showWater', JSON.stringify(!showWater));
    }

    function changeTextColor(value){
        setTextColor(value);
        localStorage.setItem('textColor', JSON.stringify(value));
    }

    function changeWaterSpotifyVisibility(){
        setShowWaterSpotify(!showWaterSpotify);
        localStorage.setItem('showWaterSpotify', JSON.stringify(!showWaterSpotify));
    }

    function changeSpotifyClientId(value){
        setSpotifyClientId(value);
        localStorage.setItem('spotifyClientId', value);
    }

    function changeSpotifyClientSecret(value){
        setSpotifyClientSecret(value);
        localStorage.setItem('spotifyClientSecret', value);
    }

    function changeSpotifyRefreshToken(value){
        setSpotifyRefreshToken(value);
        localStorage.setItem('spotifyRefreshToken', value);
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
        const spotifyInterval = setInterval(checkSpotify, 10000);
        if(!window.location.search && kraken == null)
            window.location.replace(`?no-cache=${crypto.randomUUID()}`)
        return () => clearInterval(spotifyInterval);
    }, []);

    useEffect(() => {
        setSpotifyProgressEstimated(0);
        const updateTimer = setInterval(updateSpotifyTimer, 100);
        return () => clearInterval(updateTimer);
    }, [spotifyProgress]);

    function updateSpotifyTimer(){
        setSpotifyProgressEstimated(prev => {
            const totalProgress = spotifyProgress + prev + spotifyProgressOffset;
            if(totalProgress <= spotifyDuration){
                const offset = 100 - (spotifyProgress % 100);
                setSpotifyProgressOffset(offset);
                return prev + 100;
            }
            return prev;
        });
    }

    async function checkSpotify(){
        if(spotifyClientId != "" && spotifyClientSecret != "" && spotifyRefreshToken != ""){
            const w = await getCurrentlyPlaying();
            if(w != null){
                setSpotifyCover(w.item.album.images[0].url);
                setSpotifyProgress(w.progress_ms);
                setSpotifyDuration(w.item.duration_ms);
                const artists = w.item.artists.map((artist) => artist.name).join(" ");
                setSpotifyTitle(w.item.name);
                setSpotifyArtists(artists);
            }
            else{
                setSpotifyCover("");
                setSpotifyTitle("");
                setSpotifyArtists("");
            }
        }
    }

    function convertMsToTime(ms){
        const date = new Date(ms);
        const seconds = date.getSeconds();
        const minutes = date.getMinutes();
        return `${minutes}:${(seconds < 10 ? '0' : '') + seconds}`;
    }

    window.nzxt = {
        v1: {
            onMonitoringDataUpdate: (data) => {
                const { cpus, gpus, ram } = data;
                if(cpus){
                    setCpuTemp(Math.round(cpus[0].temperature));
                }
                if(gpus){
                    setGpuTemp(Math.round(gpus[1].temperature));
                }
                if(ram){
                    setRamUsage(Math.round((ram.inUse / ram.totalSize * 100)));
                }
                const savedWaterColor = localStorage.getItem('waterColor');
                if(savedWaterColor){
                    setWaterColor(JSON.parse(savedWaterColor));
                }
                const savedShowCpu = localStorage.getItem('showCpu');
                if(savedShowCpu){
                    setShowCpu(JSON.parse(savedShowCpu));
                }
                const savedShowGpu = localStorage.getItem('showGpu');
                if(savedShowGpu){
                    setShowGpu(JSON.parse(savedShowGpu));
                }
                const savedBackgroundColor = localStorage.getItem('backgroundColor');
                if(savedBackgroundColor){
                    setBackgroundColor(JSON.parse(savedBackgroundColor));
                }
                const savedBackgroundImageUrl = localStorage.getItem('backgroundImageUrl');
                if(savedBackgroundImageUrl){
                    setBackgroundImageUrl(JSON.parse(savedBackgroundImageUrl));
                }
                const savedShowWater = localStorage.getItem('showWater');
                if(savedShowWater){
                    setShowWater(JSON.parse(savedShowWater));
                }
                const savedTextColor = localStorage.getItem('textColor');
                if(savedTextColor){
                    setTextColor(JSON.parse(savedTextColor));
                }
                const savedShowWaterSpotify = localStorage.getItem('showWaterSpotify');
                if(savedShowWaterSpotify){
                    setShowWaterSpotify(JSON.parse(savedShowWaterSpotify));
                }
                const savedSpotifyClientId = localStorage.getItem('spotifyClientId');
                if(savedSpotifyClientId){
                    setSpotifyClientId(savedSpotifyClientId);
                }
                const savedSpotifyClientSecret = localStorage.getItem('spotifyClientSecret');
                if(savedSpotifyClientSecret){
                    setSpotifyClientSecret(savedSpotifyClientSecret);
                }
                const savedSpotifyRefreshToken = localStorage.getItem('spotifyRefreshToken');
                if(savedSpotifyRefreshToken){
                    setSpotifyRefreshToken(savedSpotifyRefreshToken);
                }
            }
        }
    };

    return (
        <>
            {kraken == null ?
                <>
                    <div className={"justify-center items-center h-screen bg-no-repeat bg-cover bg-center" + (spotifyCover != "" && " bg-blend-multiply")} style={{backgroundColor: (spotifyCover != "" ? "rgba(0,0,0,0.5)" : backgroundColor), backgroundImage: "url('"+(spotifyCover != "" ? spotifyCover : backgroundImageUrl )+"')", color: textColor}}>
                        <div className="sticky z-40">
                            <div className="text-5xl text-center py-[5rem]" id="spotify_title">
                                <span className="block overflow-hidden text-ellipsis pb-5 px-4">
                                    {spotifyTitle}
                                </span>
                                <span className="text-3xl block overflow-hidden text-ellipsis whitespace-nowrap px-12">
                                    {spotifyArtists}
                                </span>
                            </div>
                        </div>
                        <div className="flex absolute justify-center items-center top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-40">
                            <div className="text-8xl flex">
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
                        {spotifyCover != "" &&
                            <div className="flex absolute justify-center items-center z-40 top-[75%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-4xl">
                                <span className="px-2">{convertMsToTime(spotifyProgress+spotifyProgressEstimated+spotifyProgressOffset)}</span>
                                <progress className="w-[20rem] text-xl rounded-lg" value={spotifyProgress+spotifyProgressEstimated+spotifyProgressOffset} max={spotifyDuration}></progress>
                                <span className="px-2">{convertMsToTime(spotifyDuration)}</span>
                            </div>
                        }
                    </div>
                    {showWater &&
                        ((showWaterSpotify && spotifyCover != "" || spotifyCover == "") &&
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
                        )
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
                        <span className="mx-5">Set spotify client id</span>
                        <input className="mx-5 text-black" type="text" value={spotifyClientId} onChange={(e) => changeSpotifyClientId(e.target.value)}/>
                    </div>
                    <div>
                        <span className="mx-5">Set spotify client secret</span>
                        <input className="mx-5 text-black" type="text" value={spotifyClientSecret} onChange={(e) => changeSpotifyClientSecret(e.target.value)}/>
                    </div>
                    <div>
                        <span className="mx-5">Set spotify refresh token</span>
                        <input className="mx-5 text-black" type="text" value={spotifyRefreshToken} onChange={(e) => changeSpotifyRefreshToken(e.target.value)}/>
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
                        <span className="mx-5">Show Water</span>
                        <input type="checkbox" checked={showWater} onChange={() => changeWaterVisibility()}/>
                    </div>
                    <div>
                        <span className="mx-5">Show water while Spotify is playing</span>
                        <input type="checkbox" checked={showWaterSpotify} onChange={() => changeWaterSpotifyVisibility()}/>
                    </div>
                </div>
            }
        </>
    );
}
