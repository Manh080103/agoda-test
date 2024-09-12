import { useEffect, useState } from "react";
import AgoraRTC, {
  IAgoraRTCClient,
  ILocalTrack,
  IRemoteAudioTrack,
} from "agora-rtc-sdk-ng";

const APP_ID = "55e91d89a1db488c97f399d0b8aa8786";
const TOKEN =
  "007eJxTYHirmsI3o9t6QcZZU2Gj4huW853XcRbnfbgRMm0no3vi+40KDKamqZaGKRaWiYYpSSYWFsmW5mnGlpYpBkkWiYkW5hZmXZGP0hoCGRkyqjYzMzJAIIjPzZCbmJehUJxaVJZaxMAAAPINIao=";
const CHANNEL = "manh server";

const VideoCall = () => {
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<ILocalTrack | null>(
    null
  );
  const [remoteUsers, setRemoteUsers] = useState<{
    [uid: string]: IRemoteAudioTrack;
  }>({});

  useEffect(() => {
    const initializeAgora = async () => {
      const rtcClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      setClient(rtcClient);

      try {
        // Join the Agora channel
        await rtcClient.join(APP_ID, CHANNEL, TOKEN, null);

        // Create and publish local audio track
        const microphoneTrack = await AgoraRTC.createMicrophoneAudioTrack();
        setLocalAudioTrack(microphoneTrack);
        await rtcClient.publish([microphoneTrack]);
        console.log("Joined channel and published local audio track");

        // Handle remote users joining
        rtcClient.on("user-published", async (user, mediaType) => {
          await rtcClient.subscribe(user, mediaType);
          if (mediaType === "audio") {
            const remoteAudioTrack = user.audioTrack as IRemoteAudioTrack;
            setRemoteUsers((prevUsers) => ({
              ...prevUsers,
              [user.uid]: remoteAudioTrack,
            }));
            remoteAudioTrack.play(); // Play the remote audio track
          }
        });

        // Handle remote users leaving
        rtcClient.on("user-unpublished", (user) => {
          if (user.audioTrack) {
            user.audioTrack.stop();
          }
          setRemoteUsers((prevUsers) => {
            const newUsers = { ...prevUsers };
            delete newUsers[user.uid];
            return newUsers;
          });
        });
      } catch (error) {
        console.error("Failed to join the channel:", error);
      }
    };

    initializeAgora();

    return () => {
      // Cleanup when the component unmounts
      if (client && localAudioTrack) {
        client.leave();
        localAudioTrack.stop();
        localAudioTrack.close();
        console.log("Left the channel and cleaned up tracks");
      }
    };
  }, []);

  const endCall = async () => {
    if (client && localAudioTrack) {
      await client.leave();
      localAudioTrack.stop();
      localAudioTrack.close();
      console.log("Call ended");
    }
  };

  return (
    <div>
      <h2>Agora Voice Call</h2>
      <div>
        <button onClick={endCall}>End Call</button>
      </div>
      {Object.keys(remoteUsers).length > 0 && (
        <div>
          <h3>Connected Users:</h3>
          <ul>
            {Object.keys(remoteUsers).map((uid) => (
              <li key={uid}>User {uid} is speaking</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default VideoCall;
