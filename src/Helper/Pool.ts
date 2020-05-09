namespace Helper {

    export class Pool<T> {

        private _classType: any;
        private _newFunction: Function = null;

        private _count: number = 0;
        private _pool: T[] = [];

        private _canGrow: boolean = true;
        
        private _poolSize: number = 0;

        // -------------------------------------------------------------------------
        constructor(classType: any, count: number, newFunction = null) {
            this._classType = classType;
            this._newFunction = newFunction;

            for (var i = 0; i < count; i++) {
                // create new item
                var item = this.newItem();
                // store into stack of free items
                this._pool[this._count++] = item;
            }
        }

        // -------------------------------------------------------------------------
        public createItem(): T {
            if (this._count === 0) {
                return this._canGrow ? this.newItem() : null;
            } else {
                return this._pool[--this._count];
            }
        }

        // -------------------------------------------------------------------------
        public destroyItem(item: T): void {
            this._pool[this._count++] = item;
        }

        // -------------------------------------------------------------------------
        protected newItem(): T {
            ++this._poolSize;

            if (this._newFunction !== null) {
                return this._newFunction();
            } else {
                return new this._classType;
            }
        }

        // -------------------------------------------------------------------------
        public set newFunction(newFunction: Function) {
            this._newFunction = newFunction;
        }

        // -------------------------------------------------------------------------
        public set canGrow(canGrow: boolean) {
            this._canGrow = canGrow;
        }
    }
}
