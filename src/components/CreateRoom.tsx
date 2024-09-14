import { useState } from "react";

export const CreateRoom = ({
  onCreateRoom,
}: {
  onCreateRoom: (channel: string) => void;
}) => {
  const [roomName, setRoomName] = useState("");

  const handleCreateRoom = () => {
    if (roomName.trim() !== "") {
      onCreateRoom(roomName);
      setRoomName("");
    }
  };
  return (
    <div>
      <h3>Create a Room</h3>
      <input
        type="text"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        placeholder="Enter room name"
      />
      <button onClick={handleCreateRoom}>Create Room</button>
    </div>
  );
};
