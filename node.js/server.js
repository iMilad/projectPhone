var port = 20001;
var team = "t3";

var http = require ("http");
var fs = require("fs");
var express = require("express");
var bodyParser = require("body-parser");
var sprintf = require("sprintf-js").sprintf;

var app = express();

app.use(bodyParser.urlencoded({extended:true}));

var server = app.listen(port,function ()
{ var host = server.address().address;

  console.log("Server listen http://%s:%s",host,port);
});

function getData (file,cb)
{ fs.readFile(file,function (error,data)
  { if (error)
    { cb(new Array());
    }
    else
    { cb(data == "" ? new Array() : JSON.parse(data));
    }
  });
}

function writeData (file,data)
{ fs.writeFile(file,JSON.stringify(data));
}

///////////////////////////////////////////////////////////////////////////////
class Projekt
{ constructor (id)
  { if (id == 0)
    { this.id = 0;
      this.code = Math.floor((Math.random() * (9999 - 1111)) + 1111);
    }

    this._name = "";
    this._marker = new Array();
  }

  set name (v)
  { this._name = v;
  }

  get name ()
  { return this._name;
  }

  save ()
  { console.log("Save");
    var o = this;

    getData("data.json",function (data)
    { if (o.id == 0)
      { console.log("neue ID generieren");
        var id = 0;

        for (var i in data)
        { if (data[i].id > id)
          { id = data[i].id;
          }
        }

        o.id = id+1;
        console.log(o);

        data.push(o);
      }
      else
      { for (var i in data)
        { if (data[i].id == o.id)
          { break;
          }
        }

        data[i] = o;
      }

      writeData("data.json",data);
    });
  }

  delete ()
  { var o = this;

    getData("data.json",function (data)
    { for (var i in data)
      { if (data[i].id == o.id)
        { break;
        }
      }

      data.splice(i,1);

      writeData("data.json",data);
    });
  }

  get_marker (id)
  { for (var i in this._marker)
    { if (this._marker[i].id == id)
      { var m = new Marker(this);
        var o = this._marker[i];

        for (var x in o)
        { m[x] = o[x];
        }

        return m;
      }
    }
  }

  json ()
  { return JSON.stringify(this);
  }

  static getById (id,cb)
  { getData("data.json",function (data)
    { for (var i in data)
      { if (data[i].id == id)
        { var p = new Projekt(id);
          var o = data[i];

          for (var x in o)
          { p[x] = o[x];
          }

          cb(p);
        }
      }
    });
  }
}

///////////////////////////////////////////////////////////////////////////////
class Marker
{ constructor (project,id=0)
  { this._project = project;
    this.project_id = project.id;

    this.id = id;
  }

  save ()
  { var o = new Object();

    o.id = this.id;
    o.name = this.name;
    o.lat = this.lat;
    o.long = this.long;

    if (o.id == 0)
    { // neue ID generieren
      var id = 0;

      for (var i in this._project._marker)
      { if (this._project._marker[i].id > id)
        { id = this._project._marker[i].id;
        }
      }

      o.id = id+1;
      this._project._marker.push(o);
      console.log("push");
    }
    else
    { for (var i in this._project._marker)
      { if (this._project._marker[i].id == o.id)
        { break;
        }
      }

      this._project._marker[i] = o;
    }

    console.log(this._project);
    this._project.save();
  }

  delete ()
  { for (var i in this._project._marker)
    { if (this._project._marker[i].id == this.id)
      { this._project._marker.splice(i,1);
        this._project.save();

        return;
      }
    }
  }
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

app.use(function (request,response,next)
{ response.setHeader("Access-Control-Allow-Origin","*");
  response.setHeader("Access-Control-Allow-Methods","GET,POST,PUT,DELETE");
  next();
});

// POST => neues Projekt anlegen
app.post("/"+team+"/project/",function (request,response)
{ console.log("neues Projekt");

  var p = new Projekt(0);
  p.name = request.body.name;

  p.save(function ()
  { response.writeHead(200,{"Content-Type": "text/html"});
    response.end(JSON.stringify({id:p.id, code:p.code}));
  });

  console.log(p);
});

// GET ALL
app.get("/"+team+"/project/",function (request,response)
{ console.log("GET ALL");
  getData("data.json",function (data)
  { response.writeHead(200,{"Content-Type": "text/html"});
    response.end(JSON.stringify(data));
  });
});

// GET ONE
app.get("/"+team+"/project/:id",function (request,response)
{ var id = request.params.id;
  console.log("GET "+id);

  Projekt.getById(id,function (p)
  { response.writeHead(200,{"Content-Type": "text/html"});
    response.end(p.json());
  });
});

// PUT
app.put("/"+team+"/project/:id",function (request,response)
{ var id = request.params.id;
  console.log("PUT "+id);
  var data = request.body;

  Projekt.getById(id,function (p)
  { for (var i in data)
    { p[i] = data[i];
    }

    p.save();

    response.writeHead(200,{"Content-Type": "text/html"});
    response.end(JSON.stringify({changed:true}));
  });
});

// DELETE
app.delete("/"+team+"/project/:id",function (request,response)
{ var id = request.params.id;

  console.log("Projekt löschen");
  console.log(id);

  Projekt.getById(id,function (p)
  { p.delete();
    response.writeHead( 200, {'Content-Type':'application/json'});
    response.end( JSON.stringify({deleted:true}));
  });
});


/*******************************************\
*     Marker                                *
\*******************************************/

// POST => neuen Marker anlegen
app.post("/"+team+"/marker/:project_id",function (request,response)
{ var data = request.body;

  Projekt.getById(request.params.project_id,function (p)
  { var marker = new Marker(p);

    marker.name = data.name;
    marker.lat = data.lat;
    marker.long = data.long;

    marker.save();

    response.writeHead(200,{"Content-Type": "text/html"});
    response.end();
  });
});

// PUT
app.put("/"+team+"/marker/:project_id/:marker_id",function (request,response)
{ var project_id = request.params.project_id;
  var marker_id = request.params.marker_id;
  var data = request.body;

  Projekt.getById(project_id,function (p)
  { console.log(p);
    var marker = p.get_marker(marker_id);

    for (var i in data)
    { marker[i] = data[i];
    }

    marker.save();

    response.writeHead(200,{"Content-Type": "text/html"});
    response.end(JSON.stringify({changed:true}));
  });
});

// DELETE
app.delete("/"+team+"/marker/:project_id/:marker_id",function (request,response)
{ var project_id = request.params.project_id;
  var marker_id = request.params.marker_id;

  Projekt.getById(project_id,function (p)
  { var marker = p.get_marker(marker_id);

    marker.delete();

    response.writeHead(200,{"Content-Type": "text/html"});
    response.end(JSON.stringify({deleted:true}));
  });
});
