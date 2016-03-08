'use strict';

class Shape{
    constructor(width, height, tip){
        this._points = [];
        this._points.push("0,0");
        this._points.push(width + ",0");
        this._points.push(width + tip + "," + (height / 2));
        this._points.push(width + "," + height);
        this._points.push("0," + height);
    }

    get coordinates(){
        return this._points;
    }
}

class RootShape extends Shape{
    constructor(width, height, tip){
        super(width, height, tip);
        super.coordinates.push(tip + "," + height/2);
    }

    get coordinates(){
        return super.coordinates;
    }
}

export {Shape, RootShape};