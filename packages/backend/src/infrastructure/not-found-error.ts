export class ResourceNotFound extends Error {
  constructor(message: string) {
    super(message);
  }
}

export default ResourceNotFound;
