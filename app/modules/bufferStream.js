import isBuffer from "is-buffer";
const stream = window.require("stream");

class BufferStream extends stream.Readable {
    constructor(source) {
        if (!isBuffer(source)) {
            throw new Error("Source must be a buffer.");
        }
        super();

        this._source = source;
        this._offset = 0;
        this._length = source.length;
        this._destroy = this._destroy.bind(this);
        this._read = this._read.bind(this);

        this.on("end", this._destroy);
    }

    _destroy() {
        this._length = null;
        this._offset = null;
        this._source = null;
    }

    _read(size) {
        if (this._offset < this._length) {
            this.push(this._source.slice(this._offset, this._offset + size));
            this._offset += size;
        }

        if (this._offset >= this._length) {
            this.push(null);
        }
    }
}

export default BufferStream;