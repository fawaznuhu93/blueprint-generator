import { Plus, Minus, RefreshCw } from 'lucide-react';
import { BlueprintEngine } from '../../utils/blueprintEngine';

// Define types inline if imports fail
type RoomType = 'living' | 'kitchen' | 'bedroom' | 'bathroom' | 'office' | 'storage' | 'dining' | 'hallway' | 'storefront' | 'reception' | 'workspace' | 'meeting' | 'break';

interface Room {
  id: string;
  name: string;
  type: RoomType;
  width: number;
  depth: number;
  area: number;
  position: { x: number; y: number };
  color: string;
  doors: {
    wall: 'north' | 'south' | 'east' | 'west';
    position: number;
    width: number;
  }[];
  windows: {
    wall: 'north' | 'south' | 'east' | 'west';
    position: number;
    width: number;
  }[];
}

interface BlueprintSpec {
  buildingType: 'house' | 'shop' | 'office' | 'restaurant';
  country: string;
  totalArea: number;
  dimensions: { width: number; depth: number };
  rooms: Room[];
  layout: 'linear' | 'central' | 'clustered' | 'open';
  unit: 'feet' | 'meters';
  createdAt: string;
}

interface RoomCustomizerProps {
  blueprint: BlueprintSpec;
  onRoomChange: (updatedBlueprint: BlueprintSpec) => void;
}

export const RoomCustomizer = ({ blueprint, onRoomChange }: RoomCustomizerProps) => {
  const adjustSize = (roomId: string, dimension: 'width' | 'depth', delta: number) => {
    const updatedRooms = blueprint.rooms.map(room => {
      if (room.id === roomId) {
        const newWidth = dimension === 'width' ? Math.max(5, room.width + delta) : room.width;
        const newDepth = dimension === 'depth' ? Math.max(5, room.depth + delta) : room.depth;
        return {
          ...room,
          width: Math.round(newWidth * 10) / 10,
          depth: Math.round(newDepth * 10) / 10,
          area: Math.round(newWidth * newDepth * 10) / 10
        };
      }
      return room;
    });
    
    const engine = new BlueprintEngine({ ...blueprint, rooms: updatedRooms });
    const reLayoutedRooms = engine.generateLayout();
    const totalArea = reLayoutedRooms.reduce((sum, room) => sum + room.area, 0);
    
    onRoomChange({
      ...blueprint,
      rooms: reLayoutedRooms,
      totalArea: Math.round(totalArea * 10) / 10
    });
  };

  const resetToDefaults = () => {
    onRoomChange({ ...blueprint, rooms: [] });
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Customize Room Sizes</h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Units: {blueprint.unit} • {blueprint.country}
          </div>
          <button 
            onClick={resetToDefaults}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Reset to AI Defaults
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {blueprint.rooms.map((room) => (
          <div key={room.id} className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-medium text-gray-800">{room.name}</div>
                <div className="text-sm text-gray-500">
                  Current: {room.width} × {room.depth} {blueprint.unit} = {room.area} sq {blueprint.unit}
                </div>
              </div>
              <div className="w-4 h-4 rounded" style={{ backgroundColor: room.color }} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">Width</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => adjustSize(room.id, 'width', -1)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Minus className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="font-mono text-gray-900">{room.width}</span>
                    <button
                      onClick={() => adjustSize(room.id, 'width', 1)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="3"
                  max={blueprint.unit === 'feet' ? '50' : '15'}
                  value={room.width}
                  onChange={(e) => adjustSize(room.id, 'width', parseFloat(e.target.value) - room.width)}
                  className="w-full h-2 bg-gray-200 rounded-lg"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>3{blueprint.unit}</span>
                  <span>{blueprint.unit === 'feet' ? '25' : '8'}{blueprint.unit}</span>
                  <span>{blueprint.unit === 'feet' ? '50' : '15'}{blueprint.unit}</span>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">Depth</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => adjustSize(room.id, 'depth', -1)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Minus className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="font-mono text-gray-900">{room.depth}</span>
                    <button
                      onClick={() => adjustSize(room.id, 'depth', 1)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="3"
                  max={blueprint.unit === 'feet' ? '50' : '15'}
                  value={room.depth}
                  onChange={(e) => adjustSize(room.id, 'depth', parseFloat(e.target.value) - room.depth)}
                  className="w-full h-2 bg-gray-200 rounded-lg"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>3{blueprint.unit}</span>
                  <span>{blueprint.unit === 'feet' ? '25' : '8'}{blueprint.unit}</span>
                  <span>{blueprint.unit === 'feet' ? '50' : '15'}{blueprint.unit}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
              Position: ({Math.round(room.position.x)}, {Math.round(room.position.y)}) • Area: {room.area} sq {blueprint.unit}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Room sizes are relative approximations. 
          For construction-final dimensions, consult with a structural engineer.
        </p>
      </div>
    </div>
  );
};