let url = 'https://people.cs.umass.edu/~joydeepb/robot.jpg';
let robot = lib220.loadImageFromURL(url);
robot.setPixel(5,100,[1,0,0]);

//imageMapXY(img: Image, f: function): Image
function imageMapXY(img, f) {
  let imgCopy = img.copy();
  for (let i = 0; i < img.width; ++i) {
    for (let j = 0; j < img.height; ++j) {
      imgCopy.setPixel(i, j, f(img,i,j));
    }
  }
  return imgCopy;
}

//imageMask(img: Image, f: function, maskValue: pixel): Image
function imageMask(img,func,maskValue){
  function maskHelper(img,x,y){
    return (func(img,x,y)) ? maskValue : img.getPixel(x,y);
  }
  return imageMapXY(img,maskHelper);
}

//totaHelper(i: number, j: number, iOp: number, jOp: number) : Pixel
function totaHelper(img,i,j,iOp,jOp,arr){
  arr[0] += img.getPixel(i+iOp,j+jOp)[0];
  arr[1] += img.getPixel(i+iOp,j+jOp)[1];
  arr[2] += img.getPixel(i+iOp,j+jOp)[2];
  return arr;
}  

//blurPixel(img : image, i : number, j : number) : Image
function blurPixel(img,i,j){
  let adjPixelVals = totaHelper(img,i,j,0,0,[0,0,0]);
  let numAdj = 1;
  //right
  if (i+1<img.width){
    adjPixelVals = totaHelper(img,i,j,1,0,adjPixelVals);
    numAdj += 1;
  }
  //left
  if (i-1>=0){
    adjPixelVals = totaHelper(img,i,j,-1,0,adjPixelVals);
    numAdj += 1;
  }
  //bot
  if (j+1<img.height){
    adjPixelVals = totaHelper(img,i,j,0,1,adjPixelVals);
    numAdj += 1;
  }
  //top
  if (j-1>=0){
    adjPixelVals = totaHelper(img,i,j,0,-1,adjPixelVals);
    numAdj += 1;
  }
  //botleft
  if(j+1<img.height && i-1>=0){
    adjPixelVals = totaHelper(img,i,j,-1,1,adjPixelVals);
    numAdj += 1;
  }
  //bot right
  if(j+1<img.height && i+1<img.width){
    adjPixelVals = totaHelper(img,i,j,1,1,adjPixelVals);
    numAdj += 1;
  }  
  //topleft
  if(i-1>=0 && j-1>=0){
    adjPixelVals = totaHelper(img,i,j,-1,-1,adjPixelVals);
    numAdj += 1;
  }
  //topright
  if(j-1>=0 && i+1<img.width){
    adjPixelVals = totaHelper(img,i,j,1,-1,adjPixelVals);
    numAdj += 1;
  }

  adjPixelVals[0]/=numAdj;
  adjPixelVals[1]/=numAdj;
  adjPixelVals[2]/=numAdj;
  // console.log("blured")
  // console.log({i:i,j:j});
  return adjPixelVals;
}

//blurImage(img: Image) :Image 
function blurImage(img){
  return imageMapXY(img,blurPixel);
}
//part 2

//imageMap(img: image, f:P=>P): Image
function imageMap(img,func){
  let imgCopy = img.copy();
  for (let i = 0; i < imgCopy.width; ++i) {
    for (let j = 0; j < imgCopy.height; ++j) {
      imgCopy.setPixel(i, j, func(img.getPixel(i,j)));
    }
  }
  return imgCopy;  
}
//imgFunc(img: image, func:T=>boolean, pixelFunc: p=>p)
function imgFunc(img,func,pixelFunc){
  function pixelFuncHelper(img,x,y){
    return (func(img,x,y)) ? pixelFunc(img,x,y) : img.getPixel(x,y);
  }
  return imageMapXY(img,pixelFuncHelper);
}

//blurHalfImage(img: Image, top: boolean): Image
function blurHalfImage(img,top){
  function which(img,x,y) { return (top) ? (y < img.height/2) : (y >= img.height/2);}
  return imgFunc(img,which,blurPixel)
}
//isGrayish(p: pixel):boolean
function isGrayish(p){
  return ((Math.max(p[0],p[1],p[2])-Math.min(p[0],p[1],p[2]))<=.3);
}

//grayPixel(img:image,x:number.y:number):Pixel
function grayPixel(img,x,y) { 
    let pixel = img.getPixel(x,y);
    let avgCol = (pixel[0] + pixel[1] + pixel[2])/3
    pixel[0] = avgCol;
    pixel[1] = avgCol;
    pixel[2] = avgCol;
    return pixel;
}
//toGrayscale(img: image):image
function toGrayscale(img){
  function grayHelper(img,x,y){
    return !isGrayish(img.getPixel(x,y));
  }
  return imgFunc(img,grayHelper,grayPixel);
}

//grayHalfImage(img: image):image
function grayHalfImage(img){
  function grayHalfHelper(img,x,y){
    return ((y >= img.height/2) && (!isGrayish(img.getPixel(x,y))));
  }
  return imgFunc(img,grayHalfHelper,grayPixel);
}

//saturateHigh(img: image):image
function saturateHigh(img){
  function makeSaturateHigh(img,x,y){
    return img.getPixel(x,y).map(x=> (x>2/3)?x*1/x:x*1);
  }
  return imageMapXY(img,makeSaturateHigh);
}

//blackenLow(img: image):image
function blackenLow(img){
  function blackenHelper(img,x,y){
    return img.getPixel(x,y).map(x=> (x<1/3)?x*0:x*1);
  }
  return imageMapXY(img,blackenHelper);
}

//reduceFunctions(funcArr: (P=>P)[]):image
function reduceFunctions(funcArr){
  function composeFunc(acc,elem){
    function newAcc(p){
       return elem(acc(p));
    }
    return newAcc;
  }
  return funcArr.reduce(composeFunc,(p=>p));
}

//colorize(img: image):image
function colorize(img){
  function grayHelperPix(p){
    if (!isGrayish(p)){
     let avgCol = (p[0] + p[1] + p[2])/3
     return [avgCol,avgCol,avgCol];
    }
    return p;
  }
  let reduceImg = reduceFunctions([x=>x.map(p=>(p<1/3)?p*0:p*1),x=>x.map(p=>(p>2/3)?p*1/p:p*1),grayHelperPix]);
  return imageMap(img,reduceImg);
}

//pixelEq(p1: pixel, p2: pixel) : boolean
function pixelEq(p1, p2) {
  const epsilon = 0.002;
  for (let i = 0; i < 3; ++i) {
    if (Math.abs(p1[i] - p2[i]) > epsilon) {
      return false;
    }
  }
  return true;
};


test('mask ', function() {    
  const pic = lib220.createImage(3, 3, [1,1,1]);

  pic.setPixel(0,0,[0.5,0.6,0.4]);
  pic.setPixel(0,1,[0.1,0.1,0.6]);
  pic.setPixel(0,2,[0.6,0.3,0.7]);
  pic.setPixel(1,0,[0.2,0.1,0.8]);
  pic.setPixel(1,1,[0.9,0.9,0.4]);
  pic.setPixel(1,2,[0.7,0.7,0.7]);
  pic.setPixel(2,0,[0.3,0.5,0.3]);
  pic.setPixel(2,1,[0.6,0.4,0.2]);
  pic.setPixel(2,2,[0.5,0.2,0.1]);

  let maskImg = imageMask(pic, function(img, x, y) {
  return (x === 1);}, [1, 1, 0]);
  
  assert(pixelEq(maskImg.getPixel(1,0),[1,1,0]));
  assert(pixelEq(maskImg.getPixel(1,1),[1,1,0]));
  assert(pixelEq(maskImg.getPixel(1,2),[1,1,0]));
  
  // console.log(maskImg.getPixel(0,0));
  // console.log(pic.getPixel(0,0));
  assert(pixelEq(maskImg.getPixel(0,0),pic.getPixel(0,0)));

  assert(pixelEq(maskImg.getPixel(0,1),pic.getPixel(0,1)));
  assert(pixelEq(maskImg.getPixel(0,2),pic.getPixel(0,2)));
  
  assert(pixelEq(maskImg.getPixel(2,0),pic.getPixel(2,0)));
  assert(pixelEq(maskImg.getPixel(2,1),pic.getPixel(2,1)));
  assert(pixelEq(maskImg.getPixel(2,2),pic.getPixel(2,2)));

});

test('blur ', function() {    
  const pic = lib220.createImage(3, 3, [1,1,1]);
  
  pic.setPixel(0,0,[0.5,0.6,0.4]);
  pic.setPixel(0,1,[0.1,0.1,0.6]);
  pic.setPixel(0,2,[0.6,0.3,0.7]);
  pic.setPixel(1,0,[0.2,0.1,0.8]);
  pic.setPixel(1,1,[0.9,0.9,0.4]);
  pic.setPixel(1,2,[0.7,0.7,0.7]);
  pic.setPixel(2,0,[0.3,0.5,0.3]);
  pic.setPixel(2,1,[0.6,0.4,0.2]);
  pic.setPixel(2,2,[0.5,0.2,0.1]);
  let blurImg = blurImage(pic);
  // console.log(blurImg.getPixel(0,0));
  // console.log([redVal,greenVal,blueVal]);

  let redVal = 0; 
  let greenVal = 0;
  let blueVal = 0;
  
  //top left
  redVal = (pic.getPixel(0,0)[0]+pic.getPixel(0,1)[0]+pic.getPixel(1,0)[0]+pic.getPixel(1,1)[0])/4;
  greenVal = (pic.getPixel(0,0)[1]+pic.getPixel(0,1)[1]+pic.getPixel(1,0)[1]+pic.getPixel(1,1)[1])/4;
  blueVal = (pic.getPixel(0,0)[2]+pic.getPixel(0,1)[2]+pic.getPixel(1,0)[2]+pic.getPixel(1,1)[2])/4;
  assert(pixelEq(blurImg.getPixel(0,0),[redVal,greenVal,blueVal]));

  //bot right
  redVal = (pic.getPixel(0,2)[0]+pic.getPixel(0,1)[0]+pic.getPixel(1,2)[0]+pic.getPixel(1,1)[0])/4;
  greenVal = (pic.getPixel(0,2)[1]+pic.getPixel(0,1)[1]+pic.getPixel(1,2)[1]+pic.getPixel(1,1)[1])/4;
  blueVal = (pic.getPixel(0,2)[2]+pic.getPixel(0,1)[2]+pic.getPixel(1,2)[2]+pic.getPixel(1,1)[2])/4;
  assert(pixelEq(blurImg.getPixel(0,2),[redVal,greenVal,blueVal]));

  //top right
  redVal = (pic.getPixel(2,0)[0]+pic.getPixel(2,1)[0]+pic.getPixel(1,0)[0]+pic.getPixel(1,1)[0])/4;
  greenVal = (pic.getPixel(2,0)[1]+pic.getPixel(2,1)[1]+pic.getPixel(1,0)[1]+pic.getPixel(1,1)[1])/4;
  blueVal = (pic.getPixel(2,0)[2]+pic.getPixel(2,1)[2]+pic.getPixel(1,0)[2]+pic.getPixel(1,1)[2])/4;
  assert(pixelEq(blurImg.getPixel(2,0),[redVal,greenVal,blueVal]));

  //botright
  redVal = (pic.getPixel(2,2)[0]+pic.getPixel(2,1)[0]+pic.getPixel(1,2)[0]+pic.getPixel(1,1)[0])/4;
  greenVal = (pic.getPixel(2,2)[1]+pic.getPixel(2,1)[1]+pic.getPixel(1,2)[1]+pic.getPixel(1,1)[1])/4;
  blueVal = (pic.getPixel(2,2)[2]+pic.getPixel(2,1)[2]+pic.getPixel(1,2)[2]+pic.getPixel(1,1)[2])/4;
  assert(pixelEq(blurImg.getPixel(2,2),[redVal,greenVal,blueVal]));

  //left
  redVal = (pic.getPixel(0,0)[0]+pic.getPixel(0,1)[0]+pic.getPixel(0,2)[0]+pic.getPixel(1,0)[0]+pic.getPixel(1,1)[0]+pic.getPixel(1,2)[0])/6;
  greenVal = (pic.getPixel(0,0)[1]+pic.getPixel(0,1)[1]+pic.getPixel(0,2)[1]+pic.getPixel(1,0)[1]+pic.getPixel(1,1)[1]+pic.getPixel(1,2)[1])/6;
  blueVal = (pic.getPixel(0,0)[2]+pic.getPixel(0,1)[2]+pic.getPixel(0,2)[2]+pic.getPixel(1,0)[2]+pic.getPixel(1,1)[2]+pic.getPixel(1,2)[2])/6;
  assert(pixelEq(blurImg.getPixel(0,1),[redVal,greenVal,blueVal]));

  //top
  redVal = (pic.getPixel(0,0)[0]+pic.getPixel(0,1)[0]+pic.getPixel(1,0)[0]+pic.getPixel(1,1)[0]+pic.getPixel(2,0)[0]+pic.getPixel(2,1)[0])/6;
  greenVal = (pic.getPixel(0,0)[1]+pic.getPixel(0,1)[1]+pic.getPixel(1,0)[1]+pic.getPixel(1,1)[1]+pic.getPixel(2,0)[1]+pic.getPixel(2,1)[1])/6;
  blueVal = (pic.getPixel(0,0)[2]+pic.getPixel(0,1)[2]+pic.getPixel(1,0)[2]+pic.getPixel(1,1)[2]+pic.getPixel(2,0)[2]+pic.getPixel(2,1)[2])/6;
  assert(pixelEq(blurImg.getPixel(1,0),[redVal,greenVal,blueVal]));

  //bot
  redVal = (pic.getPixel(0,1)[0]+pic.getPixel(0,2)[0]+pic.getPixel(1,1)[0]+pic.getPixel(1,2)[0]+pic.getPixel(2,1)[0]+pic.getPixel(2,2)[0])/6;
  greenVal = (pic.getPixel(0,1)[1]+pic.getPixel(0,2)[1]+pic.getPixel(1,1)[1]+pic.getPixel(1,2)[1]+pic.getPixel(2,1)[1]+pic.getPixel(2,2)[1])/6;
  blueVal = (pic.getPixel(0,1)[2]+pic.getPixel(0,2)[2]+pic.getPixel(1,1)[2]+pic.getPixel(1,2)[2]+pic.getPixel(2,1)[2]+pic.getPixel(2,2)[2])/6;
  assert(pixelEq(blurImg.getPixel(1,2),[redVal,greenVal,blueVal]));

  //left
  redVal = (pic.getPixel(1,0)[0]+pic.getPixel(1,1)[0]+pic.getPixel(1,2)[0]+pic.getPixel(2,0)[0]+pic.getPixel(2,1)[0]+pic.getPixel(2,2)[0])/6;
  greenVal = (pic.getPixel(1,0)[1]+pic.getPixel(1,1)[1]+pic.getPixel(1,2)[1]+pic.getPixel(2,0)[1]+pic.getPixel(2,1)[1]+pic.getPixel(2,2)[1])/6;
  blueVal = (pic.getPixel(1,0)[2]+pic.getPixel(1,1)[2]+pic.getPixel(1,2)[2]+pic.getPixel(2,0)[2]+pic.getPixel(2,1)[2]+pic.getPixel(2,2)[2])/6;
  assert(pixelEq(blurImg.getPixel(2,1),[redVal,greenVal,blueVal]));

  //mid
  redVal = (pic.getPixel(1,0)[0]+pic.getPixel(1,1)[0]+pic.getPixel(1,2)[0]+pic.getPixel(2,0)[0]+pic.getPixel(2,1)[0]+pic.getPixel(2,2)[0]+pic.getPixel(0,0)[0]+pic.getPixel(0,1)[0]+pic.getPixel(0,2)[0])/9;
  greenVal = (pic.getPixel(1,0)[1]+pic.getPixel(1,1)[1]+pic.getPixel(1,2)[1]+pic.getPixel(2,0)[1]+pic.getPixel(2,1)[1]+pic.getPixel(2,2)[1]+pic.getPixel(0,0)[1]+pic.getPixel(0,1)[1]+pic.getPixel(0,2)[1])/9;
  blueVal = (pic.getPixel(1,0)[2]+pic.getPixel(1,1)[2]+pic.getPixel(1,2)[2]+pic.getPixel(2,0)[2]+pic.getPixel(2,1)[2]+pic.getPixel(2,2)[2]+pic.getPixel(0,0)[2]+pic.getPixel(0,1)[2]+pic.getPixel(0,2)[2])/9;
  assert(pixelEq(blurImg.getPixel(1,1),[redVal,greenVal,blueVal]));
  
});

test('blurHalf true ALL', function() {    
  const pic = lib220.createImage(3, 3, [1,1,1]);
  
  pic.setPixel(0,0,[0.5,0.6,0.4]);
  pic.setPixel(0,1,[0.1,0.1,0.6]);
  pic.setPixel(0,2,[0.6,0.3,0.7]);
  pic.setPixel(1,0,[0.2,0.1,0.8]);
  pic.setPixel(1,1,[0.9,0.9,0.4]);
  pic.setPixel(1,2,[0.7,0.7,0.7]);
  pic.setPixel(2,0,[0.3,0.5,0.3]);
  pic.setPixel(2,1,[0.6,0.4,0.2]);
  pic.setPixel(2,2,[0.5,0.2,0.1]);
  let blurImg = blurHalfImage(pic,true);
  let redVal = 0; 
  let greenVal = 0;
  let blueVal = 0;
  
  //top left
  redVal = (pic.getPixel(0,0)[0]+pic.getPixel(0,1)[0]+pic.getPixel(1,0)[0]+pic.getPixel(1,1)[0])/4;
  greenVal = (pic.getPixel(0,0)[1]+pic.getPixel(0,1)[1]+pic.getPixel(1,0)[1]+pic.getPixel(1,1)[1])/4;
  blueVal = (pic.getPixel(0,0)[2]+pic.getPixel(0,1)[2]+pic.getPixel(1,0)[2]+pic.getPixel(1,1)[2])/4;
  assert(pixelEq(blurImg.getPixel(0,0),[redVal,greenVal,blueVal]));

  //bot left
  assert(pixelEq(blurImg.getPixel(0,2),pic.getPixel(0,2)));

  //top right
  redVal = (pic.getPixel(2,0)[0]+pic.getPixel(2,1)[0]+pic.getPixel(1,0)[0]+pic.getPixel(1,1)[0])/4;
  greenVal = (pic.getPixel(2,0)[1]+pic.getPixel(2,1)[1]+pic.getPixel(1,0)[1]+pic.getPixel(1,1)[1])/4;
  blueVal = (pic.getPixel(2,0)[2]+pic.getPixel(2,1)[2]+pic.getPixel(1,0)[2]+pic.getPixel(1,1)[2])/4;
  assert(pixelEq(blurImg.getPixel(2,0),[redVal,greenVal,blueVal]));

  //botright
  assert(pixelEq(blurImg.getPixel(2,2),pic.getPixel(2,2)));

  //left
  redVal = (pic.getPixel(0,0)[0]+pic.getPixel(0,1)[0]+pic.getPixel(0,2)[0]+pic.getPixel(1,0)[0]+pic.getPixel(1,1)[0]+pic.getPixel(1,2)[0])/6;
  greenVal = (pic.getPixel(0,0)[1]+pic.getPixel(0,1)[1]+pic.getPixel(0,2)[1]+pic.getPixel(1,0)[1]+pic.getPixel(1,1)[1]+pic.getPixel(1,2)[1])/6;
  blueVal = (pic.getPixel(0,0)[2]+pic.getPixel(0,1)[2]+pic.getPixel(0,2)[2]+pic.getPixel(1,0)[2]+pic.getPixel(1,1)[2]+pic.getPixel(1,2)[2])/6;
  assert(pixelEq(blurImg.getPixel(0,1),[redVal,greenVal,blueVal]));

  //top
  redVal = (pic.getPixel(0,0)[0]+pic.getPixel(0,1)[0]+pic.getPixel(1,0)[0]+pic.getPixel(1,1)[0]+pic.getPixel(2,0)[0]+pic.getPixel(2,1)[0])/6;
  greenVal = (pic.getPixel(0,0)[1]+pic.getPixel(0,1)[1]+pic.getPixel(1,0)[1]+pic.getPixel(1,1)[1]+pic.getPixel(2,0)[1]+pic.getPixel(2,1)[1])/6;
  blueVal = (pic.getPixel(0,0)[2]+pic.getPixel(0,1)[2]+pic.getPixel(1,0)[2]+pic.getPixel(1,1)[2]+pic.getPixel(2,0)[2]+pic.getPixel(2,1)[2])/6;
  assert(pixelEq(blurImg.getPixel(1,0),[redVal,greenVal,blueVal]));

  //bot
  assert(pixelEq(blurImg.getPixel(1,2),pic.getPixel(1,2)));

  //right
  redVal = (pic.getPixel(1,0)[0]+pic.getPixel(1,1)[0]+pic.getPixel(1,2)[0]+pic.getPixel(2,0)[0]+pic.getPixel(2,1)[0]+pic.getPixel(2,2)[0])/6;
  greenVal = (pic.getPixel(1,0)[1]+pic.getPixel(1,1)[1]+pic.getPixel(1,2)[1]+pic.getPixel(2,0)[1]+pic.getPixel(2,1)[1]+pic.getPixel(2,2)[1])/6;
  blueVal = (pic.getPixel(1,0)[2]+pic.getPixel(1,1)[2]+pic.getPixel(1,2)[2]+pic.getPixel(2,0)[2]+pic.getPixel(2,1)[2]+pic.getPixel(2,2)[2])/6;
  assert(pixelEq(blurImg.getPixel(2,1),[redVal,greenVal,blueVal]));

  //mid
  redVal = (pic.getPixel(1,0)[0]+pic.getPixel(1,1)[0]+pic.getPixel(1,2)[0]+pic.getPixel(2,0)[0]+pic.getPixel(2,1)[0]+pic.getPixel(2,2)[0]+pic.getPixel(0,0)[0]+pic.getPixel(0,1)[0]+pic.getPixel(0,2)[0])/9;
  greenVal = (pic.getPixel(1,0)[1]+pic.getPixel(1,1)[1]+pic.getPixel(1,2)[1]+pic.getPixel(2,0)[1]+pic.getPixel(2,1)[1]+pic.getPixel(2,2)[1]+pic.getPixel(0,0)[1]+pic.getPixel(0,1)[1]+pic.getPixel(0,2)[1])/9;
  blueVal = (pic.getPixel(1,0)[2]+pic.getPixel(1,1)[2]+pic.getPixel(1,2)[2]+pic.getPixel(2,0)[2]+pic.getPixel(2,1)[2]+pic.getPixel(2,2)[2]+pic.getPixel(0,0)[2]+pic.getPixel(0,1)[2]+pic.getPixel(0,2)[2])/9;
  assert(pixelEq(blurImg.getPixel(1,1),[redVal,greenVal,blueVal]));
  
  

});

test('blurHalf false ALL', function() {    
  const pic = lib220.createImage(3, 3, [1,1,1]);
  
  pic.setPixel(0,0,[0.5,0.6,0.4]);
  pic.setPixel(0,1,[0.1,0.1,0.6]);
  pic.setPixel(0,2,[0.6,0.3,0.7]);
  pic.setPixel(1,0,[0.2,0.1,0.8]);
  pic.setPixel(1,1,[0.9,0.9,0.4]);
  pic.setPixel(1,2,[0.7,0.7,0.7]);
  pic.setPixel(2,0,[0.3,0.5,0.3]);
  pic.setPixel(2,1,[0.6,0.4,0.2]);
  pic.setPixel(2,2,[0.5,0.2,0.1]);
  let blurImg = blurHalfImage(pic,false);
  let redVal = 0; 
  let greenVal = 0;
  let blueVal = 0;
  
    //top left
  assert(pixelEq(blurImg.getPixel(0,0),pic.getPixel(0,0)));

  //bot right
  redVal = (pic.getPixel(0,2)[0]+pic.getPixel(0,1)[0]+pic.getPixel(1,2)[0]+pic.getPixel(1,1)[0])/4;
  greenVal = (pic.getPixel(0,2)[1]+pic.getPixel(0,1)[1]+pic.getPixel(1,2)[1]+pic.getPixel(1,1)[1])/4;
  blueVal = (pic.getPixel(0,2)[2]+pic.getPixel(0,1)[2]+pic.getPixel(1,2)[2]+pic.getPixel(1,1)[2])/4;
  assert(pixelEq(blurImg.getPixel(0,2),[redVal,greenVal,blueVal]));

  //top right
  assert(pixelEq(blurImg.getPixel(2,0),pic.getPixel(2,0)));

  //botright
  redVal = (pic.getPixel(2,2)[0]+pic.getPixel(2,1)[0]+pic.getPixel(1,2)[0]+pic.getPixel(1,1)[0])/4;
  greenVal = (pic.getPixel(2,2)[1]+pic.getPixel(2,1)[1]+pic.getPixel(1,2)[1]+pic.getPixel(1,1)[1])/4;
  blueVal = (pic.getPixel(2,2)[2]+pic.getPixel(2,1)[2]+pic.getPixel(1,2)[2]+pic.getPixel(1,1)[2])/4;
  assert(pixelEq(blurImg.getPixel(2,2),[redVal,greenVal,blueVal]));

  //left
  assert(pixelEq(blurImg.getPixel(0,1),pic.getPixel(0,1)));

  //top
  assert(pixelEq(blurImg.getPixel(1,0),pic.getPixel(1,0)));

  //bot
  redVal = (pic.getPixel(0,1)[0]+pic.getPixel(0,2)[0]+pic.getPixel(1,1)[0]+pic.getPixel(1,2)[0]+pic.getPixel(2,1)[0]+pic.getPixel(2,2)[0])/6;
  greenVal = (pic.getPixel(0,1)[1]+pic.getPixel(0,2)[1]+pic.getPixel(1,1)[1]+pic.getPixel(1,2)[1]+pic.getPixel(2,1)[1]+pic.getPixel(2,2)[1])/6;
  blueVal = (pic.getPixel(0,1)[2]+pic.getPixel(0,2)[2]+pic.getPixel(1,1)[2]+pic.getPixel(1,2)[2]+pic.getPixel(2,1)[2]+pic.getPixel(2,2)[2])/6;
  assert(pixelEq(blurImg.getPixel(1,2),[redVal,greenVal,blueVal]));

  //left
  assert(pixelEq(blurImg.getPixel(2,1),pic.getPixel(2,1)));

  //mid
  assert(pixelEq(blurImg.getPixel(1,1),pic.getPixel(1,1)));
  
});

test('tograyScale', function() {   
  const pic = lib220.createImage(3, 3, [1,1,1]);
  
  pic.setPixel(0,0,[0.5,0.6,0.4]);

  pic.setPixel(0,1,[0.1,0.1,0.6]);
  pic.setPixel(0,2,[0.6,0.3,0.7]);
  pic.setPixel(1,0,[0.2,0.1,0.8]);
  pic.setPixel(1,1,[0.9,0.9,0.4]);

  pic.setPixel(1,2,[0.7,0.7,0.7]);
  pic.setPixel(2,0,[0.3,0.5,0.3]);

  pic.setPixel(2,1,[0.6,0.4,0.2]);
  pic.setPixel(2,2,[0.5,0.2,0.1]);
  let grayImg = toGrayscale(pic);
  
  
  assert(pixelEq(grayImg.getPixel(0,0),pic.getPixel(0,0)));
  assert(pixelEq(grayImg.getPixel(1,2),pic.getPixel(1,2)));
  assert(pixelEq(grayImg.getPixel(2,0),pic.getPixel(2,0)));

  let avg = (pic.getPixel(0,1)[0]+pic.getPixel(0,1)[1]+pic.getPixel(0,1)[2])/3;
  assert(pixelEq(grayImg.getPixel(0,1),[avg,avg,avg]));

  avg = (pic.getPixel(0,2)[0]+pic.getPixel(0,2)[1]+pic.getPixel(0,2)[2])/3;
  assert(pixelEq(grayImg.getPixel(0,2),[avg,avg,avg]));

  avg = (pic.getPixel(1,0)[0]+pic.getPixel(1,0)[1]+pic.getPixel(1,0)[2])/3;
  assert(pixelEq(grayImg.getPixel(1,0),[avg,avg,avg]));

  avg = (pic.getPixel(1,1)[0]+pic.getPixel(1,1)[1]+pic.getPixel(1,1)[2])/3;
  assert(pixelEq(grayImg.getPixel(1,1),[avg,avg,avg]));

  avg = (pic.getPixel(2,1)[0]+pic.getPixel(2,1)[1]+pic.getPixel(2,1)[2])/3;
  assert(pixelEq(grayImg.getPixel(2,1),[avg,avg,avg]));

  avg = (pic.getPixel(2,2)[0]+pic.getPixel(2,2)[1]+pic.getPixel(2,2)[2])/3;
  assert(pixelEq(grayImg.getPixel(2,2),[avg,avg,avg]));

});

test('toGrayScale', function() {    
  const pic = lib220.createImage(3, 3, [1,1,1]);
  
  pic.setPixel(0,0,[0.5,0.6,0.4]);
  pic.setPixel(0,1,[0.1,0.1,0.6]);
  pic.setPixel(0,2,[0.6,0.3,0.7]);
  pic.setPixel(1,0,[0.2,0.1,0.8]);
  pic.setPixel(1,1,[0.9,0.9,0.4]);
  pic.setPixel(1,2,[0.7,0.7,0.7]);
  pic.setPixel(2,0,[0.3,0.5,0.3]);
  pic.setPixel(2,1,[0.6,0.4,0.2]);
  pic.setPixel(2,2,[0.5,0.2,0.1]);
  let grayImg = grayHalfImage(pic);
  let avg = 0;
  //top left
  assert(pixelEq(grayImg.getPixel(0,0),pic.getPixel(0,0)));

  //bot left
  avg = (pic.getPixel(0,2)[0]+pic.getPixel(0,2)[1]+pic.getPixel(0,2)[2])/3;
  assert(pixelEq(grayImg.getPixel(0,2),[avg,avg,avg]));

  //top right
  assert(pixelEq(grayImg.getPixel(2,0),pic.getPixel(2,0)));

  //botright
  avg = (pic.getPixel(2,2)[0]+pic.getPixel(2,2)[1]+pic.getPixel(2,2)[2])/3;
  assert(pixelEq(grayImg.getPixel(2,2),[avg,avg,avg]));

  //left
  assert(pixelEq(grayImg.getPixel(0,1),pic.getPixel(0,1)));

  //top
  assert(pixelEq(grayImg.getPixel(1,0),pic.getPixel(1,0)));

  //bot
 
  assert(pixelEq(grayImg.getPixel(1,2),pic.getPixel(1,2)));

  //left
  assert(pixelEq(grayImg.getPixel(2,1),pic.getPixel(2,1)));

  //mid
  assert(pixelEq(grayImg.getPixel(1,1),pic.getPixel(1,1)));
  
});

test('highSat', function() {    
  const pic = lib220.createImage(3, 3, [1,1,1]);
  
  pic.setPixel(0,0,[0.5,0.6,0.4]);
  pic.setPixel(0,1,[0.1,0.1,0.6]);
  pic.setPixel(0,2,[0.6,0.3,0.7]);
  pic.setPixel(1,0,[0.2,0.1,0.8]);
  pic.setPixel(1,1,[0.9,0.9,0.4]);
  pic.setPixel(1,2,[0.7,0.7,0.7]);
  pic.setPixel(2,0,[0.3,0.5,0.3]);
  pic.setPixel(2,1,[0.6,0.4,0.2]);
  pic.setPixel(2,2,[0.5,0.2,0.1]);

  let satImg = saturateHigh(pic);

  assert(pixelEq(satImg.getPixel(0,0),pic.getPixel(0,0)));
  assert(pixelEq(satImg.getPixel(0,1),pic.getPixel(0,1)));
  assert(pixelEq(satImg.getPixel(0,2),[.6,.3,1]));
  assert(pixelEq(satImg.getPixel(1,0),[.2,.1,1]));
  assert(pixelEq(satImg.getPixel(1,1),[1,1,.4]));
  assert(pixelEq(satImg.getPixel(1,2),[1,1,1]));
  assert(pixelEq(satImg.getPixel(2,0),pic.getPixel(2,0)));
  assert(pixelEq(satImg.getPixel(2,1),pic.getPixel(2,1)));
  assert(pixelEq(satImg.getPixel(2,2),pic.getPixel(2,2)));

});

test('blackenLow', function() {    
  const pic = lib220.createImage(3, 3, [1,1,1]);
  
  pic.setPixel(0,0,[0.5,0.6,0.4]);
  pic.setPixel(0,1,[0.1,0.1,0.6]);
  pic.setPixel(0,2,[0.6,0.3,0.7]);
  pic.setPixel(1,0,[0.2,0.1,0.8]);
  pic.setPixel(1,1,[0.9,0.9,0.4]);
  pic.setPixel(1,2,[0.7,0.7,0.7]);
  pic.setPixel(2,0,[0.3,0.5,0.3]);
  pic.setPixel(2,1,[0.6,0.4,0.2]);
  pic.setPixel(2,2,[0.5,0.2,0.1]);

  let blackImg = blackenLow(pic);

  assert(pixelEq(blackImg.getPixel(0,0),pic.getPixel(0,0)));
  assert(pixelEq(blackImg.getPixel(0,1),[0,0,.6]));
  assert(pixelEq(blackImg.getPixel(0,2),[.6,0,.7]));
  assert(pixelEq(blackImg.getPixel(1,0),[0,0,.8]));
  assert(pixelEq(blackImg.getPixel(1,1),pic.getPixel(1,1)));
  assert(pixelEq(blackImg.getPixel(1,2),pic.getPixel(1,2)));
  assert(pixelEq(blackImg.getPixel(2,0),[0,.5,0]));
  assert(pixelEq(blackImg.getPixel(2,1),[.6,.4,0]));
  assert(pixelEq(blackImg.getPixel(2,2),[.5,0,0]));

});

test('colorize', function() {    
  const pic = lib220.createImage(3, 3, [1,1,1]);
  pic.setPixel(0,0,[0.5,0.6,0.4]);
  pic.setPixel(0,1,[0.1,0.1,0.6]);
  pic.setPixel(0,2,[0.6,0.3,0.7]);
  pic.setPixel(1,0,[0.2,0.1,0.8]);
  pic.setPixel(1,1,[0.9,0.9,0.4]);
  pic.setPixel(1,2,[0.7,0.7,0.7]);
  pic.setPixel(2,0,[0.3,0.5,0.3]);
  pic.setPixel(2,1,[0.6,0.4,0.2]);
  pic.setPixel(2,2,[0.5,0.2,0.1]);

  let cImg = colorize(pic);
  //let bsg = toGrayscale(saturateHigh(blackenLow(pic)));
  assert(pixelEq(cImg.getPixel(0,0),pic.getPixel(0,0)));

  assert(pixelEq(cImg.getPixel(0,1),[.2,.2,.2]));
  assert(pixelEq(cImg.getPixel(0,2),[8/15,8/15,8/15]));
  assert(pixelEq(cImg.getPixel(1,0),[1/3,1/3,1/3]));
  assert(pixelEq(cImg.getPixel(1,1),[2.4/3,2.4/3,2.4/3]));
  assert(pixelEq(cImg.getPixel(1,2),[1,1,1]));
  assert(pixelEq(cImg.getPixel(2,0),[.5/3,.5/3,.5/3]));
  assert(pixelEq(cImg.getPixel(2,1),[1/3,1/3,1/3]));
  assert(pixelEq(cImg.getPixel(2,2),[.5/3,.5/3,.5/3]));

});

