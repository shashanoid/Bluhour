"use client";
import React, { useEffect, useState, useRef, ComponentProps } from "react";
import "./video.css";
import axios from "axios";
import io from "socket.io-client";
import { TextGenerateEffect } from "./text-generate-effect";
import { MotionCanvasPlayerProps } from "@revideo/player";
import "./revideo-project-styles.css";
// import { metaData } from "./metadata";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "revideo-player": MotionCanvasPlayerProps & ComponentProps<"div">;
    }
  }
}

import { SparklesCore } from "./sparkles";
const SparklesCoreNew = React.memo(SparklesCore);
type Narration = {
  type: string;
  content: string;
};

interface FuturisticProgressBarProps {
  progress: string;
}

const FuturisticProgressBar: React.FC<FuturisticProgressBarProps> = ({
  progress,
}) => {
  const getProgressWidth = (progress: string): string => {
    switch (progress) {
      case "Creating scenes...":
        return "20%";
      case "Creating visuals...":
        return "40%";
      case "Creating video...":
        return "80%";
      case "Video creation completed.":
        return "100%";
      default:
        return "0%";
    }
  };

  return (
    <div className="progress-container">
      <div
        className="progress-bar"
        style={{ width: getProgressWidth(progress) }}
      ></div>
    </div>
  );
};

const Video: React.FC = () => {
  const [text, setText] = useState<string>("");
  const [editMode, setEditMode] = useState<boolean>(true);
  const [shortsId, setShortsId] = useState<number | null>(null);
  const [scenes, setScenes] = useState<Narration[]>([]);
  const [progress, setProgress] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const showSparklesRef = useRef<boolean>(true);
  const [showSparkles, setShowSparkles] = useState<boolean>(true);
  const [showArtistButtons, setShowArtistButtons] = useState<boolean>(true);
  const [artist, setArtist] = useState<string>("");

  const [metadata, setMetadata] = useState<any>(null);
  const [fontColor, setFontColor] = useState("yellow");
  const [assetsLoaded, setAssetsLoaded] = useState(true);
  const [exportInProgress, setExportInProgress] = useState(false);
  const [downloadLink, setDownloadLink] = useState(null);

  const [youtubeUrl, setYoutubeUrl] = useState<string>("");

  useEffect(() => {
    import("@revideo/player");
  }, []);

  useEffect(() => {
    if (metadata && fontColor) {
      setMetadata({ ...metadata });
    }
  }, [fontColor]);

  const socket = io("http://127.0.0.1:3001/");

  // This function ensures that we have all assets downloaded before showing the player
  // useEffect(() => {
  //   const preloadLinks: HTMLLinkElement[] = [];
  //   let loadedImagesCount = 0;
  //   const totalImages = metadata?.images.length;

  //   if (metadata && metadata.images) {
  //     metadata.images.forEach((imageUrl: string) => {
  //       const link = document.createElement("link");
  //       link.rel = "preload";
  //       link.as = "image";
  //       link.href = imageUrl;
  //       link.crossOrigin = "anonymous";
  //       document.head.appendChild(link);
  //       preloadLinks.push(link);
  //       const img = new Image();
  //       img.onload = () => {
  //         loadedImagesCount++;
  //         if (loadedImagesCount === totalImages) {
  //           setAssetsLoaded(true);
  //         }
  //       };
  //       img.src = imageUrl;
  //     });
  //   }
  //   return () => {
  //     preloadLinks.forEach((link) => {
  //       document.head.removeChild(link);
  //     });
  //   };
  // }, [metadata]);

  useEffect(() => {
    const handleStatusUpdate = (data: any) => {
      setProgress(data.status);
      console.log("Progress update:", data.status);

      if (data.status === "download ready") {
        console.log("Download ready");
        console.log(data.downloadLink);
        setDownloadLink(data.downloadLink);
      }

      if (data.status === "Video creation completed." && shortsId) {
        videoRef.current?.load();
        videoRef.current?.play();
        if (showSparklesRef.current) {
          setShowSparkles(false);
          showSparklesRef.current = false;
        }

        axios.post("/api/metadata", { shortId: shortsId }).then((res) => {
          setMetadata({ ...res.data, fontColor: "blue" });
        });
      } else if (data.status === "Creating visuals..." && shortsId) {
        axios
          .post("/api/getscenesdata", { shortId: shortsId, type: "data.json" })
          .then((res) => {
            const filtered_scene = res.data.filter(
              (item: any) => item.type === "text"
            );
            setScenes(filtered_scene);
          });
      }
    };

    socket.on("status", handleStatusUpdate);

    return () => {
      socket.off("status", handleStatusUpdate);
    };
  }, [shortsId]);

  const handleTextSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    setShowArtistButtons(false);
    event.preventDefault();
    showSparklesRef.current = true;
    setShowSparkles(true);
    setEditMode(false);
    askGpt(text);
    setText("");
    setProgress("");
  };

  const askGpt = async (storyLine: string): Promise<void> => {
    try {
      const response = await axios.post("/api/createshort", {
        messages: storyLine,
        voice_type: artist,
      });
      const shortId = response.data.short_id;
      await setShortsId(shortId);
    } catch (error) {
      console.error("Error processing the request:", error);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setText(event.target.value);
  };

  const handleYoutubeLinkChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setYoutubeUrl(event.target.value);
  };

  const handleYoutubeSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ): void => {
    setShowArtistButtons(false);
    event.preventDefault();
    showSparklesRef.current = true;
    setShowSparkles(true);
    setEditMode(false);

    axios
      .post("/api/youtube", { youtubeUrl })
      .then((res) => {
        console.log("Youtube response:", res);
        axios
          .post("/api/metadata", { shortId: res.data.short_id })
          .then((res) => {
            // console.log("Metadata response:", res.data);
            setMetadata({ ...res.data, fontColor: "red" });
          });

        if (showSparklesRef.current) {
          setShowSparkles(false);
          showSparklesRef.current = false;
        }
      })
      .catch((error) => {
        console.error("Error submitting YouTube URL:", error);
        // Optionally update the UI to reflect the error
      });

    setYoutubeUrl("");
    setProgress("");
  };

  const handleArtistSelection = (selectedArtist: string) => {
    setArtist(selectedArtist);
  };

  const isArtistSelected = (name: string) => {
    return artist === name;
  };

  const handleExport = async () => {
    setExportInProgress(true);
    try {
      await axios.post("/api/export", { metadata: metadata }).then((res) => {
        console.log("Export response:", res);
      });
    } catch (error) {
      console.error("Error during export:", error);
      setExportInProgress(false);
    }
  };

  const handleDownload = () => {
    if (downloadLink) {
      const link = document.createElement("a");
      link.href = downloadLink;
      link.setAttribute("download", "true");
      document.body.appendChild(link);
      link.click();
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
      setDownloadLink(null);
      setExportInProgress(false);
    }
  };

  return (
    <div className="video-container">
      <div className="card">
        <div className="side side1">
          {showSparkles ? (
            <SparklesCoreNew
              background="transparent"
              minSize={0.4}
              maxSize={1}
              particleDensity={1200}
              className="w-full h-full"
              particleColor="#fff"
              // particleColor="#3dbeb1"
            />
          ) : (
            <>
              {metadata && assetsLoaded ? (
                <div className="shorts-container">
                  <revideo-player
                    src="/revideo-project.js"
                    variables={JSON.stringify(metadata)}
                  />
                  {/* <button onClick={() => handleDownload()}>download</button> */}
                </div>
              ) : (
                <div>Loading player...</div>
              )}
            </>
          )}
        </div>
        <div className="divider"></div>
        <div className="side side2">
          <div
            className="content-container"
            style={
              showArtistButtons
                ? { flexDirection: "row" }
                : { flexDirection: "column" }
            }
          >
            {showArtistButtons ? (
              <div style={{ width: "100%" }}>
                <h1 style={{ fontSize: 10, marginLeft: 10 }}>Voice Catalog</h1>
                <div>
                  {[
                    "andrew-tate",
                    "donald-trump",
                    "taylor-swift",
                    "elon-musk",
                    "joe-biden",
                    "kanye-west",
                    "morgan-freeman",
                    "none",
                  ].map((name) => (
                    <button
                      key={name}
                      className={`button-futuristic ${
                        isArtistSelected(name) ? "highlighted" : ""
                      }`}
                      onClick={() => handleArtistSelection(name)}
                    >
                      {name.replace(/-/g, " ")}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {editMode ? (
              <div>
                <TextGenerateEffect words="BlueHour Studios®" />
                <code style={{ fontSize: 10 }}>AI Video generator</code>
              </div>
            ) : (
              <div className="content">
                {scenes.length > 0 ? (
                  <h1
                    style={{ fontSize: 24, fontWeight: "bold", marginLeft: 4 }}
                  >
                    Scenes
                  </h1>
                ) : null}
                <div className="scene-content-container">
                  {scenes.map((narration, index) => (
                    <p key={index} className="scene-content">
                      {narration.content}
                    </p>
                  ))}
                </div>
                <div style={{ marginTop: 8 }}>
                  <p className="progress-text">{progress}</p>
                </div>
              </div>
            )}
            {/*<form onSubmit={handleYoutubeSubmit} className="input-form">
              <input
                type="text"
                value={youtubeUrl}
                onChange={handleYoutubeLinkChange}
                placeholder="Type a youtube link here..."
                className="slick-input"
              />
              <button type="submit">Submit</button>
          </form> */}
            <form onSubmit={handleTextSubmit} className="input-form">
              <input
                type="text"
                value={text}
                onChange={handleChange}
                placeholder="Type a story here..."
                className="slick-input"
              />
              <button type="submit">Submit</button>
            </form>
            {showArtistButtons ? null : (
              <FuturisticProgressBar progress={progress} />
            )}
          </div>
          {!downloadLink && metadata && (
            <button
              onClick={handleExport}
              className="beautiful-button"
              disabled={exportInProgress}
            >
              {exportInProgress ? "Preparing..." : "Export"}
            </button>
          )}
          {downloadLink && (
            <button onClick={handleDownload} className="beautiful-button">
              Download
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Video;
