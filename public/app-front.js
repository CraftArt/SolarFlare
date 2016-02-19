var Crumb = function Crumb() {

    this._initCommonSvgPoints = function (points) {
        points.push("0,0");
        points.push(this.width + ",0");
        points.push(this.width + this.tip + "," + (this.height / 2));
        points.push(this.width + "," + this.height);
        points.push("0," + this.height);
    };

    this.height = 30;
    this.width = 85;
    this.tip = 10;
    this.space = 3;
    this.data = {};
    this.svgPoints = [];
};

Crumb.prototype.init = function init(data) {
    this.data = data;
    this._initCommonSvgPoints(this.svgPoints);
};

var BreadCrumb = function BreadCrumb() {
    this.height = 0;
};

BreadCrumb.prototype.createChain = function (nodes) {
    //Composing crumb chain
    this.root = new RootCrumb();
    this.children = [];
    for (var node in nodes) {
        var childCrumb = new Crumb(node);
        this.children.push(childCrumb);
    }

};

var RootCrumb = function RootCrumb() {
    this._initRootSvgPoints = function(){
        this._initCommonSvgPoints()
    };
};

RootCrumb.prototype = new Crumb();
RootCrumb.constructor = Crumb;

var LastCrumb = function ChildCrumb() {
    this.prototype = new Crumb();
    this.constructor = Crumb;
};

var RootShape = function RootShape() {

};