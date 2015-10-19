I'm going to show you how to go from the map of Mars regions from the planetary society to a full, web-friendly map with GeoJSON/TopoJSON regions using Mapbox.

![Mars major features](/images/mars_major_features.jpg)

(see also [USGS approximate boundaries for Mars regional features (pdf)](http://planetarynames.wr.usgs.gov/images/mola_regional_boundaries.pdf))


We're going to actually color-code an image and then extract the boundaries.

#### Crop the image
First we'll need to pre-process the image of mars territories.  Load up the image in GIMP and crop it to your desired latitude and longitude.  I cropped it to -70 to +70 latitude lines.  Use the select tool and then do Layer > Crop to selection.  

![Crop the image](/images/mars_crop2.png)

#### Add a helper layer
To make things easier to select similar regions, we'll duplicate the map layer and blur the whole thing with an 80x80px gaussian blur.  

#### Make your regions
Tips:

It's okay if your regions seem a little pixelated or choppy, the convert to SVG step will smooth it out.




#### Convert to SVG
This is super easy.  we'll use an online converter to do it!
http://image.online-convert.com/convert-to-svg
For nerds: the conversion is done on their server by [potrace](http://potrace.sourceforge.net/).
