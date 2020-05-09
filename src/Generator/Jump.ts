namespace Generator {

  export class Jump {

      public offsetY: number = 0;
      public offsetX: number = 0;

      // -------------------------------------------------------------------------
      public toString(): string {
          return "offsetX: " + this.offsetX + ", offsetY: " + this.offsetY;
      }
  }
}
