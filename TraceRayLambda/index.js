exports.handler =  (event, context, callback) => {
    var ray = require('./ray');
    var vector = require('./vector');
    var randUnitSphere = require('./randUnit')(vector);
    var metal = require('./metalShader')(ray, randUnitSphere);
    var diffuse = require('./diffuseShader')(ray, randUnitSphere);
    var camera = require('./camera')(ray);
    var sphereSurface = require('./sphere');
    var color = require('./colorRenderer')(vector);

    function createVector(vectorModel){
        return vector(vectorModel.x, vectorModel.y, vectorModel.z);
    }

    function createCamera(cameraModel){
        return camera(createVector(cameraModel.lowerCorner),createVector(cameraModel.horizontal),createVector(cameraModel.vertical),createVector(cameraModel.origin));
    }

    function createSphere(sphereModel){
        console.log("creating sphere");
        var material = diffuse(createVector(sphereModel.material.color));
        if(sphereModel.material.type == 'metal'){
            material = metal(createVector(sphereModel.material.color), sphereModel.material.options);
        }
        return sphereSurface(createVector(sphereModel.center), sphereModel.radius, material);
    }

    console.log('I really want to do some raytracing!!');
    let res;
    if (event.traceJob) {
        let traceJob =  event.traceJob;
        let camera = createCamera(traceJob.camera);
        let imageData = [];
        let samples = 10;
        
        function start(spheres){
            try{
                console.log('Great! You sent me a line to raytrace!!!!!');
                console.log("I'll perform the best traceJob of your life buddy!");
                for (var x = 0; x < traceJob.width; x++) {
                    var c = vector(0.0, 0.0, 0.0);
                    for (var s = 0; s < samples; s++) {
                        var u = (x + Math.random()) / traceJob.width;
                        var v = (traceJob.line + Math.random()) / traceJob.height;
                        var r = camera.getRay(u, v);
                        c     = c.add(color(r, spheres));
                    }
                    c                  = c.divide(samples).sqrt();
                    imageData.push(Math.floor(255 * c.x));
                    imageData.push(Math.floor(255 * c.y));
                    imageData.push(Math.floor(255 * c.z));
                    imageData.push(255);
                }
            } catch(e){
                console.log(e);
                res = {status:500, body: e};
            }
            console.log('All done!')
            res = {
                line:traceJob.line,
                imageData:imageData
            };
        }
        var spheres = [];
        traceJob.spheres.forEach(function(sphere){
            spheres.push(createSphere(sphere));
            if(spheres.length === traceJob.spheres.length){
                start(spheres);
            }
        });
    }
    else {
        res = {
            status: 400,
            body: "Please pass a vallid traceJob!"
        };
    }
    callback(null, res);
};
