import { useEffect, useRef } from "react";
import { IUser } from "./VideoRoom";

export const VideoPlayer = ({ user }: { user: IUser }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (user.videoTrack && ref.current) {
      user.videoTrack.play(ref.current);
    }
  }, []);

  return (
    <div>
      Uid: {user.uid}
      <div ref={ref} style={{ width: "200px", height: "200px" }}></div>
    </div>
  );
};
