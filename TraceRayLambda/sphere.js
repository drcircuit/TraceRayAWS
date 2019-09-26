module.exports = function(center, radius, material) {

    return {
        center: center,
        radius: radius,
        material: material,
        hit: function (ray, tmin, tmax) {
            var oc    = ray.origin.subtract(center);
            var a     = ray.direction.dotmul(ray.direction);
            var b     = ray.direction.dotmul(oc);
            var c     = oc.dotmul(oc) - radius * radius;
            var limit = b * b - a * c;
            if (limit < 0) {
                return {
                    t: 0.0,
                    hit: false
                };
            }

            var temp = (-b - Math.sqrt(limit)) / a;
            var r    = ray.pointAt(temp);
            if (temp < tmax && temp > tmin) {
                return {
                    hit: true,
                    t: temp,
                    r: r,
                    normal: r.subtract(center).divide(radius)
                }
            }
            temp = (-b + Math.sqrt(limit)) / a;
            r    = ray.pointAt(temp);
            if (temp < tmax && temp > tmin) {
                return {
                    hit: true,
                    t: temp,
                    r: r,
                    normal: r.subtract(center).divide(radius)
                }
            }
            return {
                t: -1.0,
                hit: false
            };
        }
    }
}