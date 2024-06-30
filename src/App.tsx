import './App.css';

import imageCircle from './shapes/circle.png'
import imageTriangle from './shapes/triangle.png'
import imageSquare from './shapes/square.png'

import imageSphere from './shapes/sphere.png';
import imageTetrahedron from './shapes/tetrahedron.png';
import imageCube from './shapes/cube.png';
import imageCone from './shapes/cone.png';
import imageCylinder from './shapes/cylinder.png';
import imagePrism from './shapes/prism.png';

import { useState } from 'react';
import React from 'react';

enum TwoD {
  circle = 1,
  triangle = 2,
  square = 4,
}

// const TwoDMap = {
//   1: TwoD.circle,
//   2: TwoD.triangle,
//   4: TwoD.square
// }

const TwoDImages = {
  [TwoD.circle]: imageCircle,
  [TwoD.triangle]: imageTriangle,
  [TwoD.square]: imageSquare,
}

const TwoDLetters = {
  [TwoD.circle]: 'C',
  [TwoD.triangle]: 'T',
  [TwoD.square]: 'S',
}

type TwoDSet = [TwoD, TwoD, TwoD];

enum ThreeD {
  sphere = 2,
  tetrahedron = 4,
  cube = 8,
  cone = 3,
  cylinder = 5,
  prism = 6,
}

const ThreeDMap = {
  2: ThreeD.sphere,
  4: ThreeD.tetrahedron,
  8: ThreeD.cube,
  3: ThreeD.cone,
  5: ThreeD.cylinder,
  6: ThreeD.prism,
}

// const ThreeDTwoDMap = {
//   [ThreeD.sphere]: [TwoD.circle, TwoD.circle],
//   [ThreeD.tetrahedron]: [TwoD.triangle, TwoD.triangle],
//   [ThreeD.cube]: [TwoD.square, TwoD.square],
//   [ThreeD.cone]: [TwoD.circle, TwoD.triangle],
//   [ThreeD.cylinder]: [TwoD.circle, TwoD.square],
//   [ThreeD.prism]: [TwoD.triangle, TwoD.square]
// }

const ThreeDImages = {
  [ThreeD.sphere]: imageSphere,
  [ThreeD.tetrahedron]: imageTetrahedron,
  [ThreeD.cube]: imageCube,
  [ThreeD.cone]: imageCone,
  [ThreeD.cylinder]: imageCylinder,
  [ThreeD.prism]: imagePrism,
}

type ThreeDSet = [ThreeD, ThreeD, ThreeD];
type WallSet = [TwoD[], TwoD[], TwoD[]];
type CleanseSet = [boolean[], boolean[], boolean[]]

function shuffleTwoD(): TwoDSet {
  let array: TwoDSet = [TwoD.circle, TwoD.triangle, TwoD.square];
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function threeDFromTwoD(a: TwoD, b: TwoD): ThreeD {
  let counter: number = a + b;
  return ThreeDMap[counter];
}

// Create a set of 3D objects that collectively contain 2 of each 2D object
function shuffleThreeD(shapes: TwoDSet): ThreeDSet {
  let spareShapes = [TwoD.circle, TwoD.triangle, TwoD.square]
  for (let i = spareShapes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [spareShapes[i], spareShapes[j]] = [spareShapes[j], spareShapes[i]];
  }
  const newThreeD: ThreeDSet = [
    threeDFromTwoD(shapes[0], spareShapes[0]),
    threeDFromTwoD(shapes[1], spareShapes[1]),
    threeDFromTwoD(shapes[2], spareShapes[2]),
  ];
  if (shapes != null && determineIsCorrect(shapes, newThreeD)) {
    return shuffleThreeD(shapes);
  }
  return newThreeD;
}

function initialiseWalls(shapes: TwoDSet): WallSet {
  let spareShapes = [TwoD.circle, TwoD.triangle, TwoD.square]
  for (let i = spareShapes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [spareShapes[i], spareShapes[j]] = [spareShapes[j], spareShapes[i]];
  }
  const newWalls: WallSet = [
    [shapes[0], spareShapes[0]],
    [shapes[1], spareShapes[1]],
    [shapes[2], spareShapes[2]],
  ];
  return newWalls;
}

function initialiseCleanse(): CleanseSet {
  const newCleanse: CleanseSet = [
    [false, false],
    [false, false],
    [false, false]
  ]
  return newCleanse
}

function renderMainControls(
  onReset: () => void,
  onResetAndRandomize: () => void,
  isDisplayingLetters: boolean,
  toggleLetters: () => void,
) {
  return <div className="ControlPanel">
    <button className="ControlPanelButton" onClick={onReset}>Reset</button>
    <button className="ControlPanelButton" onClick={onResetAndRandomize}>Reset & Randomize</button>
    <label htmlFor="lettersToggle">Use Letters:</label>
    <input id="lettersToggle" type="checkbox" checked={isDisplayingLetters} onChange={toggleLetters}/>
  </div>
}

function renderCurrentShapes(shapes: TwoDSet, useLetters: boolean) {

  const shapeImages = shapes.map((shape) => {
    if (useLetters) {
      return <div className="ImageBackground LetterBackground">
      <p className="CalloutLetter">{TwoDLetters[shape]}</p>
    </div>;
    }
    return <div className="ImageBackground CurrentShapeA">
      <img src={TwoDImages[shape]} alt="CurrentShapeA" className="CurrentVolumeImage"/>
    </div>;
  });

  return <>
    <h2 className={"CurrentShapesTitle"}>Callouts</h2>
    <div className="CurrentVolumes CurrentShapes">
      {shapeImages}
    </div>
  </>;
}

function renderCurrentWall(
  wall: TwoD[],
  isHolding: number|null, 
  isHeld: boolean,
  pickUp: (index: number) => void,
  targets: number[],
  sendToTarget: (idx: number, target: number, index: number|null) => void,
  sentToTarget: boolean[],
  cleansed: boolean[]
) {

  const wallImages = wall.map((shape, i) => {
    return <div className="ImageBackground WallShape">
      <img src={TwoDImages[shape]} alt="CurrentShapeA" className={(isHolding !== null && isHolding === i) ? "CurrentVolumeImageDissected" : (cleansed[i]) ? "CurrentVolumeImageCleansed" : "CurrentVolumeImageUncleansed"}/>
      <button onClick={() => pickUp(i)} disabled={isHeld}>Pick Up</button>
    </div>;
  });

  return <>
    <div className="WallShapes">
      {wallImages}
    </div>
    <div className="RoomSendWrapper">
      <button className="RoomSendButtons" onClick={() => sendToTarget(0, targets[0], isHolding)} disabled={!isHeld}>Send Room {targets[0] + 1}</button>
      <button className="RoomSendButtons" onClick={() => sendToTarget(1, targets[1], isHolding)} disabled={!isHeld}>Send Room {targets[1] + 1}</button>
    </div>
  </>

}

function renderCurrentVolumes(
  volumes: ThreeDSet,
  shapes: TwoDSet,
  held: TwoD|null,
  dissected: [number, TwoD]|null,
  dissect: (index: number) => void,
) {

  const dissectAvailable: boolean[] = volumes.map((volume, i) => {
    if (held === null || (dissected !== null && dissected[0] === i)) {
      return false;
    }
    // Volumes are a sum of two shapes, both of which must be powers of 2
    return Math.log2(volume - held) % 1 === 0;
  });

  const volumeImages = volumes.map((volume, i) => {
    return <div className="ImageBackground CurrentVolumeA">
      <img src={ThreeDImages[volume]} alt="CurrentVolumeA" className={(dissected !== null && dissected[0] === i) ? "CurrentVolumeImageDissected" : "CurrentVolumeImage"}/>
      <button disabled={!dissectAvailable[i]} onClick={() => dissect(i)}>{(dissected !== null && dissected[0] === i) ? "Dissected" : "Dissect"}</button>
    </div>
  });

  const isCorrect = determineIsCorrect(shapes, volumes);

  return <>
    <h2 className={"CurrentVolumesTitle"}>Held by Statues (<span className={isCorrect ? "Correct" : "Incorrect"}>{isCorrect ? 'Correct!' : 'Incorrect'}</span>)</h2>
    <div className="CurrentVolumes">
      {volumeImages}
    </div>
  </>;
}

function renderShapeHeld(shape: TwoD|null) {
  return <>
      <h2 className={"CurrentVolumesTitle"}>Shape Held</h2>
      <div className="DroppedShapes">
        {shape === null ? [] : <div className="ImageBackground DroppedShape"><img src={TwoDImages[shape]} alt="CurrentShapeA" className="CurrentVolumeImage"/></div>}
    </div>
  </>;
}

function renderShapesDropped(shapes: [number, TwoD][], isHeld: boolean, pickUp: (index: number) => void) {

  const renderedShapes = shapes.map((shape, i) => {
    return <div className="ImageBackground DroppedShape">
      <img src={TwoDImages[shape[1]]} alt="CurrentShapeA" className="CurrentVolumeImage"/>
      <button onClick={() => pickUp(i)} disabled={isHeld}>Pick Up</button>
    </div>;
  });

  return <>
      <h2 className={"CurrentVolumesTitle"}>Shapes Dropped</h2>
      <div className="DroppedShapes">
      {renderedShapes}
    </div>
  </>
}

function renderKnightControls(
  shapesNotDropped: TwoD[],
  killKnight: () => void,
  killOgres: () => void,
) {
  return <div className="LowerControls">
    <button className="ControlPanelButton" disabled={!shapesNotDropped.length} onClick={killKnight}>Kill Knight</button>
    <button className="ControlPanelButton" disabled={!!shapesNotDropped.length} onClick={killOgres}>Kill Ogres</button>
  </div>;
}

function renderRoomsCorrect(
  shapes: TwoDSet,
  walls: WallSet,
  cleansed: CleanseSet
) {

  const isCorrect = determineWallsCorrect(shapes, walls, cleansed);

  return <>
    <h2 className="OtherTitle">Solution (<span className={isCorrect ? "Correct" : "Incorrect"}>{isCorrect ? 'Correct!' : 'Incorrect'}</span>)</h2>
  </>;
}

function determineIsCorrect(shapes: TwoDSet, volumes: ThreeDSet) {
  return volumes.every((volume, i) => {
    return Math.log2(volume - shapes[i]) % 1 !== 0 && Math.log2(volume / 2) % 1 !== 0;
  });
}

function determineWallsCorrect(shapes: TwoDSet, walls: WallSet, rooms: [boolean[], boolean[], boolean[]]) {
  let roomSizes = walls.every((wall, i) => {
    return wall.length === 2;
  });
  let roomsCleansed = rooms.every((room, i) => {
    return room.every(b => b === true);
  });
  if (roomSizes && roomsCleansed) {
    let effectiveVolumes: ThreeDSet = [
      threeDFromTwoD(walls[0][0], walls[0][1]),
      threeDFromTwoD(walls[1][0], walls[1][1]),
      threeDFromTwoD(walls[2][0], walls[2][1])
    ]
    return determineIsCorrect(shapes, effectiveVolumes);
  }
  return false;
}

function App() {
  const [useLetters, setUseLetters] = useState<boolean>(true);
  const [shapes, setShapes] = useState<TwoDSet>(shuffleTwoD());
  const [initialVolumes, setInitialVolumes] = useState<ThreeDSet>(shuffleThreeD(shapes));
  const [volumes, setVolumes] = useState<ThreeDSet>(initialVolumes);
  const [initialWalls, setInitialWalls] = useState<WallSet>(initialiseWalls(shapes));
  const [walls, setWalls] = useState<WallSet>(structuredClone(initialWalls));
  const [initialCleanse, setInitialCleanse] = useState<CleanseSet>(initialiseCleanse());
  const [cleansed, setCleansed] = useState<CleanseSet>(structuredClone(initialCleanse));
  const [currentlyHeld, setCurrentlyHeld] = useState<TwoD|null>(null);
  const [currentlyDissected, setCurrentlyDissected] = useState<[number, TwoD]|null>(null);
  const [currentlyHeldInsideOne, setCurrentlyHeldInsideOne] = useState<number|null>(null);
  const [currentlyHeldInsideTwo, setCurrentlyHeldInsideTwo] = useState<number|null>(null);
  const [currentlyHeldInsideThree, setCurrentlyHeldInsideThree] = useState<number|null>(null);
  const [shapesDropped, setShapesDropped] = useState<[number, TwoD][]>([]);
  const [shapesNotDropped, setShapesNotDropped] = useState<TwoD[]>(shuffleTwoD());
  const [roomOneSentTargets, setRoomOneSentTargets] = useState<boolean[]>([false, false]);
  const [roomTwoSentTargets, setRoomTwoSentTargets] = useState<boolean[]>([false, false]);
  const [roomThreeSentTargets, setRoomThreeSentTargets] = useState<boolean[]>([false, false]);

  const softReset = () => {
    setCurrentlyHeld(null);
    setCurrentlyDissected(null);
    setCurrentlyHeldInsideOne(null);
    setCurrentlyHeldInsideTwo(null);
    setCurrentlyHeldInsideThree(null);
    setShapesDropped([]);
    setShapesNotDropped(shuffleTwoD());
    setRoomOneSentTargets([false, false]);
    setRoomTwoSentTargets([false, false]);
    setRoomThreeSentTargets([false, false]);
  }

  return (
    <div className="App">
      <header className="AppHeader">
        <h1>Verity Simulator</h1>
      </header>
      <div className="Top">
        {renderMainControls(
          () => {
            setVolumes(initialVolumes);
            setWalls(structuredClone(initialWalls));
            setCleansed(structuredClone(initialCleanse));
            softReset();
          },
          () => {
            const newShapes = shuffleTwoD();
            const newVolumes = shuffleThreeD(newShapes);
            const newWalls = initialiseWalls(newShapes);
            const newCleanse = initialiseCleanse();
            setInitialVolumes(newVolumes);
            setInitialWalls(structuredClone(newWalls));
            setInitialCleanse(structuredClone(newCleanse));
            setShapes(newShapes);
            setVolumes(newVolumes);
            setWalls(newWalls);
            setCleansed(newCleanse);
            softReset();
          },
          useLetters,
          () => setUseLetters(!useLetters)
        )}
      </div>
      <div className="TopState">
        <div className="Readouts"></div>
        {renderCurrentShapes(shapes, useLetters)}
      </div>
      <div className="Background">
        <div className="MainColumnDouble">
        <div className="TopSection">
            <h2 className="SectionTitle">Inside</h2>
          </div>
          <div className="MainColumnContent">
            <div className="WallSpread">
              <div className="RoomReadouts">
                <h2 className={"CurrentVolumesTitle"}>Room 1</h2>
                {renderCurrentWall(
                  walls[0], 
                  currentlyHeldInsideOne,
                  currentlyHeldInsideOne != null,
                  (index: number) => {
                    setCurrentlyHeldInsideOne(index);
                  },
                  [1, 2],
                  (idx: number, target: number, index: number|null) => {
                    if (index != null) {
                      walls[target].push(...walls[0].splice(index, 1));
                      cleansed[0].splice(index, 1);
                      cleansed[target].push(true);
                      roomOneSentTargets[idx] = true;
                      setWalls(walls);
                      setCurrentlyHeldInsideOne(null);
                      setRoomOneSentTargets(roomOneSentTargets);
                    }
                  },
                  roomOneSentTargets,
                  cleansed[0]
                )}
              </div>
              <div className="RoomReadouts">
                <h2 className={"CurrentVolumesTitle"}>Room 2</h2>
                {renderCurrentWall(
                  walls[1],
                  currentlyHeldInsideTwo,
                  currentlyHeldInsideTwo != null,
                  (index: number) => {
                    setCurrentlyHeldInsideTwo(index);
                  },
                  [0, 2],
                  (idx: number, target: number, index: number|null) => {
                    if (index != null) {
                      walls[target].push(...walls[1].splice(index, 1));
                      cleansed[1].splice(index, 1);
                      cleansed[target].push(true);
                      roomTwoSentTargets[idx] = true;
                      setWalls(walls);
                      setCurrentlyHeldInsideTwo(null);
                      setRoomTwoSentTargets(roomTwoSentTargets);
                    }
                  },
                  roomTwoSentTargets,
                  cleansed[1]
                )}
              </div>
              <div className="RoomReadouts">
                <h2 className={"CurrentVolumesTitle"}>Room 3</h2>
                {renderCurrentWall(
                  walls[2], 
                  currentlyHeldInsideThree,
                  currentlyHeldInsideThree != null,
                  (index: number) => {
                    setCurrentlyHeldInsideThree(index);
                  },
                  [0, 1],
                  (idx: number, target: number, index: number|null) => {
                    if (index != null) {
                      walls[target].push(...walls[2].splice(index, 1));
                      cleansed[2].splice(index, 1);
                      cleansed[target].push(true);
                      roomThreeSentTargets[idx] = true;
                      setWalls(walls);
                      setCurrentlyHeldInsideThree(null);
                      setRoomThreeSentTargets(roomThreeSentTargets);
                    }
                  },
                  roomThreeSentTargets,
                  cleansed[2]
                )}
              </div>
            </div>
            {renderRoomsCorrect(
              shapes,
              walls,
              cleansed
            )}
          </div>
        </div>
        <div className="MainColumn">
          <div className="TopSection">
            <h2 className="SectionTitle">Outside</h2>
          </div>
          <div className="MainColumnContent">
            <div className="Readouts">
              {renderCurrentVolumes(
                volumes,
                shapes,
                currentlyHeld,
                currentlyDissected,
                (index: number) => {
                  if (currentlyDissected === null) {
                    setCurrentlyDissected([index, currentlyHeld || 0]);
                    setCurrentlyHeld(null);
                    return;
                  }
                  const newVolumes: ThreeDSet = [...volumes];
                  const firstSwap = currentlyDissected[1];
                  const secondSwap = currentlyHeld || 0;
                  const firstVolumeIndex = currentlyDissected[0];
                  const secondVolumeIndex = index;
                  newVolumes[firstVolumeIndex] += secondSwap - firstSwap;
                  newVolumes[secondVolumeIndex] += firstSwap - secondSwap;
                  setVolumes(newVolumes);
                  setCurrentlyDissected(null);
                  setCurrentlyHeld(null);
                }
              )}
              {renderShapeHeld(currentlyHeld)}
              {renderShapesDropped(
                shapesDropped,
                currentlyHeld != null,
                (index: number) => {
                  const newShapesDropped = [...shapesDropped];
                  const [pickedUpShape] = newShapesDropped.splice(index, 1);
                  setCurrentlyHeld(pickedUpShape[1]);
                  setShapesDropped(newShapesDropped);
                }
              )}
              {renderKnightControls(
                shapesNotDropped,
                () => {
                  const newShapesNotDropped = shapesNotDropped;
                  const newShapeDropped = newShapesNotDropped.pop() || TwoD.circle;
                  setShapesNotDropped(newShapesNotDropped);
                  setShapesDropped([...shapesDropped, [Date.now(), newShapeDropped]])
                },
                () => {
                  setShapesDropped([])
                  setShapesNotDropped(shuffleTwoD())
                },
              )}
            </div>
          </div>
        </div>
      </div>
      <footer className="AppFooter"></footer>
    </div>
  );
}

export default App;
