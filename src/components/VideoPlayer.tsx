import React, { useEffect, useRef } from "react";
import { IUser } from "./VideoRoom";

interface VideoPlayerProps {
  user: IUser;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ user }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user.videoTrack) {
      user.videoTrack?.play(ref.current!);
    }
  }, [user]);

  return (
    <>
      Uid: {user.uid}
      <div
        ref={ref}
        style={{
          width: "200px",
          height: "200px",
          overflow: "hidden",
          backgroundColor: "#000",
        }}
      ></div>
    </>
  );
};
