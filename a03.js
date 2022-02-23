/*
  3D simple ray tracing scene A03

  Author: Amir Mohammad Esmaieeli Sikaroudi
  Email: amesmaieeli@email.arizona.edu
  Date: Feb 20, 2022

  The library for decoding PNG files is from:
  https://github.com/arian/pngjs
 */


//access DOM elements we'll use
var input = document.getElementById("load_scene");
var output = document.getElementById("save_image")
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

input.addEventListener("change", upload);


function upload() {
    if (input.files.length > 0) {
        //Read all selected files by user.
        //User must select one scene file (JSON) and other related images at the same time from the file selection dialog.
        //One way to make sure all files are read before rendering is to use an array of booleans for all input files.
        //Whenever each file is read, set that index to true. In the rendering loop when all booleans are true, set a global boolean to true.
        //If the global boolean is true, you are safe to render your scene.
        //However, you are free to implement it in your way.
        for(var i=0;i<input.files.length;i++)
		{
            var file = input.files[i];
			var reader = new FileReader();
            reader.onload = (function(f,index) {
				return function(e) {
					//Get the file name
					let fileName = f.name;
					//Get the file Extension 
					let fileExtension = fileName.split('.').pop();
                    if(fileExtension=='json')
					{
						var file_data = this.result;
                        // scene = parseJSONScene(file_data);
						// Suitable place to set the boolean variable to true for this input
					}else if(fileExtension=='png')
					{
                        //An example code to read PNG file by "png.js" library
						var file_data = this.result;
						var pngImage = new PNGReader(file_data);
						pngImage.parse(function(err, png){
							if (err) throw err;
							let img = parsePNG(png,fileName);
                            // allImages.push(img);
							// Suitable place to set the boolean variable to true for this input
							// *** This is a show case of how PNGImage can be shown in Canvas. REMOVE COMMENT TO SEE THE RESULT
							/*
							let width=img.width;
							let height=img.height;
							document.getElementById("canvas").setAttribute("width", img.width);
							document.getElementById("canvas").setAttribute("height", img.height);
							let showCaseData = ctx.createImageData(width, height);
							for(var i = 0; i < img.data.length; i+=1){
								showCaseData.data[i*4]=img.data[i].r;
								showCaseData.data[i*4+1]=img.data[i].g;
								showCaseData.data[i*4+2]=img.data[i].b;
								showCaseData.data[i*4+3]=img.data[i].a;
							}
							ctx.putImageData(showCaseData, canvas.width/2 - width/2, canvas.height/2 - height/2);
							*/
							// *** This is a show case of how PNGImage can be shown in Canvas. REMOVE COMMENT TO SEE THE RESULT
						});
					}
				};
			})(file,i);
			let fileName = file.name;
			let fileExtension = fileName.split('.').pop();
			if(fileExtension=='ppm' || fileExtension=='js' || fileExtension=='json')
			{
				reader.readAsBinaryString(file);
			}else if(fileExtension=='png'){
				reader.readAsArrayBuffer(file);
			}
        }
        //You can enter the rendering loop now, but same as previous homeworks, be careful to check in the renderer if the files are all read or not by a boolean variable.
    }
}

function renderingLoop() {
    // You are free to implement in your way. The following are just some hints.
    // Make sure all files are read (boolean array).
    // Connect billboards with the loaded images. This should be done after reading all materials because you are not sure which material will be read first.
    // If all of the above steps finished, now set a global boolean variable to true (isReadyToRender) and don't repeat the above steps again.
    // If "isReadyToRender==true", do the rendering.
    // IN RENDERING LOOP:
    // Prepare the camera coordinates, prepare a framebuffer (bitmap), and initialize one ray for each pixel in the camera space.
    // Shoot each ray to all objects, i.e. billboards and spheres.
    //      Find all collision points and put the colors of the collisions in a list.
    //      Find the closest collision but carefully discard the collisions that have transparency i.e. pixel.a == 0 or pixel.a<255.
    //      Draw the final color of the ray to the camera pixel. If collision list is empty, draw background color.
    // Draw the camera framebuffer (bitmap) to the canvas.
}

function parseJSONScene(file_data)//A simple function to read JSON
{

}

//The function for parsing PNG is done for you. The output is a an array of RGBA instances.
function parsePNG(png,fileName){
	let rawValues = png.getRGBA8Array();
	let width = png.getWidth();
	let height = png.getHeight();
	var readImageValues=[];//Array of RGBA instances
	var counterMain=0;//It is used for array of RGBAValue instances.
	for(var i = 0; i < rawValues.length; i++){
		let r=rawValues[i*4];
		let g=rawValues[i*4+1];
		let b=rawValues[i*4+2];
		let a=rawValues[i*4+3];
		readImageValues[counterMain]=new RGBAValue(r,g,b,a);
		counterMain=counterMain+1;
	}
	return new PNGImage(readImageValues,width,height,fileName);
}

class PNGImage{
	constructor(data,width,height,fileName){
		this.data=data;// The 1D array of RGBA pixel instances
		this.fileName=fileName;// Filename is useful to connect this image to appropriate Billboard after all materials are read.
		this.width=width;// Width of image
		this.height=height;// Height of image
	}
}

//RGBA class. You could use class structure for your scene, camera, billboards, spheres, rays, etc. if you prefer.
class RGBAValue{
	constructor(r,g,b,a)
	{
		this.r=r;
		this.g=g;
		this.b=b;
		this.a=a;
	}
}

class Vector3{//Required math functions are made from scratch
	constructor(x,y,z){
		this.x=x;
		this.y=y;
		this.z=z;
	}
	static multiplyVectorScalar(vec,scalar){
		return new Vector3(vec.x*scalar,vec.y*scalar,vec.z*scalar);
	}
	static sumTwoVectors(vec1,vec2){
		return new Vector3(vec1.x+vec2.x,vec1.y+vec2.y,vec1.z+vec2.z);
	}
	static minusTwoVectors(vec1,vec2){
		return new Vector3(vec1.x-vec2.x,vec1.y-vec2.y,vec1.z-vec2.z);
	}
	static normalizeVector(vec){
		let sizeVec=Math.sqrt(Math.pow(vec.x,2)+Math.pow(vec.y,2)+Math.pow(vec.z,2));
		return new Vector3(vec.x/sizeVec,vec.y/sizeVec,vec.z/sizeVec);
	}
	static crossProduct(vec1,vec2){
		return new Vector3(vec1.y * vec2.z - vec1.z * vec2.y,vec1.z * vec2.x - vec1.x * vec2.z,vec1.x * vec2.y - vec1.y * vec2.x);
	}
	static negate(vec){
		return new Vector3(-vec.x,-vec.y,-vec.z);
	}
	static dotProduct(vec1,vec2){
		var result = 0;
		result += vec1.x * vec2.x;
		result += vec1.y * vec2.y;
		result += vec1.z * vec2.z;
		return result;
	}
	static distance(p1,p2){
		return Math.sqrt(Math.pow(p1.x-p2.x,2)+Math.pow(p1.y-p2.y,2)+Math.pow(p1.z-p2.z,2));
	}
	static getMagnitude(vec){
		return Math.sqrt(Math.pow(vec.x,2)+Math.pow(vec.y,2)+Math.pow(vec.z,2));
	}
}