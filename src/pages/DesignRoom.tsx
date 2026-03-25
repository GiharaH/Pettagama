import { useNavigate } from 'react-router-dom'
import DesignRoomApp from '@outfit-designer/App'

export function DesignRoom() {
  const navigate = useNavigate()
  return (
    <div id="design-room-root">
      <DesignRoomApp onBack={() => navigate('/')} />
    </div>
  )
}
