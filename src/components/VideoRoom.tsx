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
const APP_ID = "55e91d89a1db488c97f399d0b8aa8786";
const TOKEN =
  "007eJxTYHirmsI3o9t6QcZZU2Gj4huW853XcRbnfbgRMm0no3vi+40KDKamqZaGKRaWiYYpSSYWFsmW5mnGlpYpBkkWiYkW5hZmXZGP0hoCGRkyqjYzMzJAIIjPzZCbmJehUJxaVJZaxMAAAPINIao=";
const CHANNEL = "manh server";

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
      setUsers((previousUsers) => [...previousUsers, user]);
    }

    if (mediaType === "audio" && user.audioTrack) {
      user.audioTrack.play(); // Optionally play audio if required
    }
  };

  // Handle when a user leaves the channel
  const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
    setUsers((previousUsers) =>
      previousUsers.filter((u) => u.uid !== user.uid)
    );
  };

  useEffect(() => {
    // Register event listeners
    client.on("user-published", handleUserJoined);
    client.on("user-left", handleUserLeft);

    // Join the Agora channel and publish local tracks
    client
      .join(APP_ID, CHANNEL, TOKEN, null)
      .then((uid) =>
        Promise.all([AgoraRTC.createMicrophoneAndCameraTracks(), uid])
      )
      .then(([tracks, uid]) => {
        const [audioTrack, videoTrack] = tracks;
        setLocalTracks(tracks);
        setUsers((previousUsers) => [
          ...previousUsers,
          {
            uid,
            videoTrack,
            audioTrack,
          },
        ]);
        client.publish(tracks);
      });

    return () => {
      // Clean up when leaving the component
      for (const localTrack of localTracks) {
        localTrack.stop();
        localTrack.close();
      }
      client.off("user-published", handleUserJoined);
      client.off("user-left", handleUserLeft);
      client.unpublish(localTracks).then(() => client.leave());
    };
  }, [localTracks]);

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
