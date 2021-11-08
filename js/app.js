class TestBedApp
{
    static instance = null;
    app;
    objects;

    frameCount = 0;
    totalDelta = 0;
    averageFPS = 0;

    constructor(app)
    {
        
        app.ticker.add(this.tick);

        if(TestBedApp.instance == null)
        {
            TestBedApp.instance = this;
        }

        this.app = app;

        this.objects = new Array();

        for(let i = 0; i < 8000; i++)
        {
            this.objects.push(new TestObject(getRandomArbitrary(0,1024-51),getRandomArbitrary(0,800-51),10,10,0xBBFFBB));
        }

        this.font = 'foobar';
        PIXI.BitmapFont.from(this.font, {
            fill: "#000000",
            fontSize: 24,
            
        }, { resolution: devicePixelRatio });

        this.averageFPS = new PIXI.BitmapText("Average FPS:", { fontName: this.font });
        this.averageFPS.roundPixels = true;
        this.averageFPS.anchor.set(0.5);
        this.app.stage.addChild(this.averageFPS);
        this.averageFPS.y += 25;
        this.averageFPS.x = this.app.screen.width - 150;

    }

    static debug = false;

    tick(delta)
    {
        delta = TestBedApp.instance.app.ticker.elapsedMS;
        TestBedApp.instance.update(delta);
    }

    once = false;

    update(delta)
    {
        if(this.totalDelta >= 1000)
        {
            this.averageFPS.text = "Average FPS: " + this.frameCount.toString();
            this.totalDelta = 0;
            this.frameCount = 0;
        }


        //Sort objects on the X Axis
        this.objects = this.objects.sort(function compareFn(a, b) { if(a.bounds.x < b.bounds.x) {return -1;} return 1; });

        for(let i =0; i < this.objects.length; i++)             
        {
            this.objects[i].update(delta);
            this.objects[i].colliding = false;


            let minX = this.objects[i].bounds.x;
            let maxX = this.objects[i].bounds.x + this.objects[i].bounds.width;

            //Look forward for collisions
            for(let j = i+1; j < this.objects.length-1; j++)
            {
                if(maxX < this.objects[j].bounds.x) 
                {
                   break;
                }

                if(this.objects[i].intersects(this.objects[j]))
                {
                    this.objects[i].colliding = true;
                }

                if(this.objects[i].colliding == true)
                {
                    break;
                }
            }

            //Look backwards
            for(let j = i-1; j >=0; j--)
            {
                if(minX > this.objects[j].bounds.x + this.objects[j].bounds.width) 
                {
                    break;
                }

                if(this.objects[i].intersects(this.objects[j]))
                {
                    this.objects[i].colliding = true;
                }

                if(this.objects[i].colliding == true)
                {
                    break;
                }

            }
        }

        this.frameCount++;
        this.totalDelta += delta;
    }
}



PIXI.Rectangle.prototype.intersects = function intersects(other)
{
    const x0 = this.x < other.x ? other.x : this.x;
    const x1 = this.right > other.right ? other.right : this.right;
    if (x1 <= x0)
    {
        return false;
    }
    const y0 = this.y < other.y ? other.y : this.y;
    const y1 = this.bottom > other.bottom ? other.bottom : this.bottom;
    return y1 > y0;
};

 PIXI.Rectangle.prototype.containsRect = function containsRect(other)
 {
     if (other.width <= 0 || other.height <= 0)
     {
         return other.x > this.x && other.y > this.y && other.right < this.right && other.bottom < this.bottom;
     }
     return other.x >= this.x && other.y >= this.y && other.right <= this.right && other.bottom <= this.bottom;
 };


class TestObject
{
    bounds;
    gfx;
    travelVectorX;
    travelVectorY;
    color;

    colliding = false;

    constructor(x,y,width,height, color)
    {
        this.bounds = new PIXI.Rectangle(x,y,width,height);

        this.gfx = new PIXI.Graphics();
        this.gfx.beginFill(color);
        this.gfx.drawRect(0, 0, width, height);
        this.gfx.x = x;
        this.gfx.y = y;
        
        
        // Add it to the stage to render
        TestBedApp.instance.app.stage.addChild(this.gfx);

        this.travelVectorX = getRandomArbitrary(-15,15) * 5;
        this.travelVectorY = getRandomArbitrary(-15,15) * 5;

        this.color = color;
    }

    update(delta)
    {
        this.gfx.x += this.travelVectorX / (delta);
        this.gfx.y += this.travelVectorY / (delta);

        if(this.gfx.x < 0 || this.gfx.x > TestBedApp.instance.app.screen.width - this.gfx.width)
        {
            this.travelVectorX = -this.travelVectorX;
        }

        if(this.gfx.y < 0 || this.gfx.y > TestBedApp.instance.app.screen.height - this.gfx.height)
        {
            this.travelVectorY = -this.travelVectorY;
        }

        this.bounds.x = this.gfx.x;
        this.bounds.y = this.gfx.y;

        if(this.colliding == true)
        {
            this.gfx.tint = 0xFF0000;
        }
        else
        {
            this.gfx.tint = 0xFFFFFF;
        }
    }

    intersects(other)
    {
        return this.bounds.intersects(other.bounds);
    }
}


window.onload = function()
{

    // Use the native window resolution as the default resolution
    // will support high-density displays when rendering
    PIXI.settings.RESOLUTION = window.devicePixelRatio;

    // The application will create a renderer using WebGL, if possible,
    // with a fallback to a canvas render. It will also setup the ticker
    // and the root stage PIXI.Container
    const app = new PIXI.Application({width: 1024, height: 800, backgroundColor: 0xdbdbdb});
    


    // The application will create a canvas element for you that you
    // can then insert into the DOM
    document.body.appendChild(app.view);

    window.testBedApp = new TestBedApp(app);
}

function getRandomArbitrary(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}