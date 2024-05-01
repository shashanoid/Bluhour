"use client";
import { useEffect, useState, useMemo } from "react";
import { MotionCanvasPlayerProps } from "@revideo/player";
import { ComponentProps } from "react";
import "./revideo-project-styles.css";
import { metaData } from "./metadata";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "revideo-player": MotionCanvasPlayerProps & ComponentProps<"div">;
    }
  }
}

export default function Edit({ params }: { params: { id: string } }) {
  const [metadata, setMetadata] = useState<any>(null);
  const [fontColor, setFontColor] = useState("cool");
  const [assetsLoaded, setAssetsLoaded] = useState(true);
  const id = params.id;

  useEffect(() => {
    setMetadata(metaData);
    }, []);

  useEffect(() => {
    import("@revideo/player");
  }, []);

  useEffect(() => {
    if (metadata && fontColor) {
      setMetadata({
        ...metadata,
        fontColor: fontColor,
      });
    }
  }, [fontColor]);

  //   useEffect(() => {
  //     if (id) {
  //       const fetchData = async () => {
  //         try {
  //           setMetadata({
  //             ...metaData,
  //             fontColor: "red",
  //           });
  //         } catch (error) {
  //           console.error("Fetching metadata failed:", error);
  //         }
  //       };

  //       fetchData();
  //     }
  //   }, [id]);

  // This function ensures that we have all assets downloaded before showing the player
  useEffect(() => {
    const preloadLinks: HTMLLinkElement[] = [];
    let loadedImagesCount = 0;
    const totalImages = metadata?.images.length;

    if (metadata && metadata.images) {
      metadata.images.forEach((imageUrl: string) => {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = imageUrl;
        link.crossOrigin = "anonymous";
        document.head.appendChild(link);
        preloadLinks.push(link);
        const img = new Image();
        img.onload = () => {
          loadedImagesCount++;
          if (loadedImagesCount === totalImages) {
            setAssetsLoaded(true);
          }
        };
        img.src = imageUrl;
      });
    }
    return () => {
      preloadLinks.forEach((link) => {
        document.head.removeChild(link);
      });
    };
  }, [metadata]);

  return (
    <>
      <div>
        <div className="w-[35%]">
          {metadata && assetsLoaded ? (
            <revideo-player
              src="/revideo-project.js"
              variables={JSON.stringify(metadata)}
            />
          ) : (
            <div>Loading player...</div>
          )}
        </div>
      </div>
    </>
  );
}
