import React, { useEffect, useState } from "react";
import AgoraRTC, {
  IAgoraRTCClient,
  IRemoteVideoTrack,
  IRemoteAudioTrack,
  ILocalTrack,
  IAgoraRTCRemoteUser,
} from "agora-rtc-sdk-ng";
import { VideoPlayer } from "./VideoPlayer";
// import { CreateRoom } from "./CreateRoom";
import { RoomList } from "./RoomList";

// Constants for Agora
const APP_ID = "a19fb1008eba457d89903c2db1098386";
const TOKEN =
  "007eJxTYMj5Hbhtz3TLI1N+v52yYML843NuhZ9VbJyUdunuPQHd+Va1CgyJhpZpSYYGBhapSYkmpuYpFpaWBsbJRilAMUsLYwszNZYnaQ2BjAxh2ieYGRkgEMRnZshLzGVgAAAb1SED";
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
  const [rooms, setRooms] = useState<string[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  useEffect(() => {
    const storedRooms = localStorage.getItem("rooms");
    if (storedRooms) {
      setRooms(JSON.parse(storedRooms));
    }
  }, []);

  // Handle when a user joins the channel
  const handleUserJoined = async (
    user: IAgoraRTCRemoteUser,
    mediaType: "video" | "audio"
  ) => {
    await client.subscribe(user, mediaType);

    if (mediaType === "video" && user.videoTrack) {
      setUsers((previousUsers) => [
        ...previousUsers.filter((u) => u.uid !== user.uid),
        { ...user, videoTrack: user.videoTrack },
      ]);
      user.videoTrack.play(`user-${user.uid}`);
    }

    if (mediaType === "audio" && user.audioTrack) {
      user.audioTrack.play();
      // captureAudioStream(user.audioTrack)
      setUsers((previousUsers) => [
        ...previousUsers.filter((u) => u.uid !== user.uid),
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

  // const captureAudioStream = (audioTrack: IRemoteAudioTrack) => {
  //   // Create an AudioContext for capturing the audio stream
  //   const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
  //   // Create a media stream source from the Agora audio track
  //   const mediaStream = new MediaStream([audioTrack.getMediaStreamTrack()]);
  //   const mediaStreamSource = audioContext.createMediaStreamSource(mediaStream);
  
  //   // Connect the audio to the destination (playback)
  //   mediaStreamSource.connect(audioContext.destination);
  
  //   // Now you can analyze the audio stream or process it further
  //   // For example, create an analyser node to capture audio data for speech-to-text
  //   const analyser = audioContext.createAnalyser();
  //   mediaStreamSource.connect(analyser);
  
  //   // This is just an example of capturing audio data
  //   const dataArray = new Uint8Array(analyser.frequencyBinCount);
  //   analyser.getByteFrequencyData(dataArray);
  
  //   // You can send the audio data to a speech-to-text service here
  //   // For now, we just log that the audio is being captured
  //   console.log("Capturing audio stream...");
  // };
  

  const joinRoom = async (channel: string) => {
    setSelectedRoom(channel);

    client.on("user-published", handleUserJoined);
    client.on("user-left", handleUserLeft);

    // Join the Agora channel and create local tracks
    const uid = await client.join(APP_ID, channel, TOKEN, null);
    const [audioTrack, videoTrack] =
      await AgoraRTC.createMicrophoneAndCameraTracks();
    setLocalTracks([audioTrack, videoTrack]);

    setUsers((prevUsers) => [
      ...prevUsers,
      {
        uid,
        videoTrack,
        audioTrack,
      },
    ]);

    await client.publish([audioTrack, videoTrack]);
    videoTrack.play(`user-${uid}`);
  };

  useEffect(() => {
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

  const handleCreateRoom = () => {
    if (!rooms.includes(CHANNEL)) {
      const updatedRooms = [...rooms, CHANNEL];
      setRooms(updatedRooms);
      localStorage.setItem("rooms", JSON.stringify(updatedRooms));
    }
  };

  const handleJoinRoom = (roomName: string) => {
    joinRoom(roomName);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      {!selectedRoom ? (
        <div>
          {/* <CreateRoom onCreateRoom={handleCreateRoom} /> */}
          <button onClick={handleCreateRoom}>Create Room</button>
          <RoomList rooms={rooms} onJoinRoom={handleJoinRoom} />
        </div>
      ) : (
        <div>
          <h2>Room: {selectedRoom}</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 200px)",
            }}
          >
            {users.map((user) => (
              <div key={user.uid} id={`user-${user.uid}`}>
                <VideoPlayer user={user} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
