export function isValidCoordinates(location: string): boolean {
    if (!location) return false;
    const regex = /^-?\d{1,3}(\.\d+)?,\s*-?\d{1,3}(\.\d+)?$/;
    console.log("location", location);   

    return regex.test(location);
  }
  