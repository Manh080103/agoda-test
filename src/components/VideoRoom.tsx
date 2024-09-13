import React, { useEffect, useState } from "react";
import AgoraRTC, {
  IAgoraRTCClient,
  IRemoteVideoTrack,
  IRemoteAudioTrack,
  ILocalTrack,
  IAgoraRTCRemoteUser,
} from "agora-rtc-sdk-ng";
import { VideoPlayer } from "./VideoPlayer";

// Constants for Agora
const APP_ID = "a19fb1008eba457d89903c2db1098386";
const TOKEN =
  "007eJxTYHCUWFH4Jl/uCIPs+xs737ydpW/Ka1csYNseK/5t/aonLk8VGBINLdOSDA0MLFKTEk1MzVMsLC0NjJONUoBilhbGFmZ71j5OawhkZDjNzsTIyACBID4zQ15iLgMDABaYHpc=";
const CHANNEL = "nam";

// Agora Client Initialization
const client: IAgoraRTCClient = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8",
});

// User Interface type for local and remote users
export interface IUser {
  uid: string | number;
  videoTrack?: IRemoteVideoTrack | ILocalTrack;
  audioTrack?: IRemoteAudioTrack | ILocalTrack;
}

export const VideoRoom: React.FC = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [localTracks, setLocalTracks] = useState<ILocalTrack[]>([]);

  // Handle when a user joins the channel
  const handleUserJoined = async (
    user: IAgoraRTCRemoteUser,
    mediaType: "video" | "audio"
  ) => {
    await client.subscribe(user, mediaType);

    if (mediaType === "video" && user.videoTrack) {
      setUsers((previousUsers) => [
        ...previousUsers,
        { ...user, videoTrack: user.videoTrack },
      ]);
    }

    if (mediaType === "audio" && user.audioTrack) {
      user.audioTrack.play();
      setUsers((previousUsers) => [
        ...previousUsers,
        { ...user, audioTrack: user.audioTrack },
      ]);
    }
  };

  // Handle when a user leaves the channel
  const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
    setUsers((previousUsers) =>
      previousUsers.filter((u) => u.uid !== user.uid)
    );
  };

  useEffect(() => {
    const joinAndPublish = async () => {
      // Register event listeners
      client.on("user-published", handleUserJoined);
      client.on("user-left", handleUserLeft);

      // Join the Agora channel and create local tracks
      const uid = await client.join(APP_ID, CHANNEL, TOKEN, null);
      const [audioTrack, videoTrack] =
        await AgoraRTC.createMicrophoneAndCameraTracks();
      setLocalTracks([audioTrack, videoTrack]);

      // Add local user to the state
      setUsers((previousUsers) => [
        ...previousUsers,
        {
          uid,
          videoTrack,
          audioTrack,
        },
      ]);

      // Publish local tracks
      await client.publish([audioTrack, videoTrack]);
    };

    joinAndPublish();

    return () => {
      // Clean up when leaving the component
      localTracks.forEach((track) => {
        track.stop();
        track.close();
      });
      client.off("user-published", handleUserJoined);
      client.off("user-left", handleUserLeft);
      client.unpublish(localTracks).then(() => client.leave());
    };
  }, []);

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 200px)",
        }}
      >
        {users.map((user) => (
          <VideoPlayer key={user.uid} user={user} />
        ))}
      </div>
    </div>
  );
};
