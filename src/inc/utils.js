const movePoint = (p1, p2, dist) => {
  return {
    x: p1.x + (p2.x - p1.x) * dist,
    y: p1.y + (p2.y - p1.y) * dist
  }
}

const vecAdjustMagnitude = (vec2d, scaleBy) => {
  const currentMagnitude = Math.sqrt(vec2d.x * vec2d.x + vec2d.y * vec2d.y)
  if (!currentMagnitude) return vec2d
  return {
    x: vec2d.x * (currentMagnitude * scaleBy.x) / currentMagnitude,
    y: vec2d.y * (currentMagnitude * scaleBy.y) / currentMagnitude
  }
}

const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

const fit = (current, in_min, in_max, out_min, out_max) => {
  const mapped = ((current - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
  return clamp(mapped, out_min, out_max);
}

export {
  movePoint,
  vecAdjustMagnitude,
  clamp,
  fit
}