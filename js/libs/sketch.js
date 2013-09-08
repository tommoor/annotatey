var __slice = [].slice;

(function($) {
  var Sketch, getColor, pickRandomColor, randomNumber;
  $.fn.sketch = function() {
    var args, key, sketch;
    key = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if (this.length > 1) {
      $.error('Sketch.js can only be called on one element at a time.');
    }
    sketch = this.data('sketch');
    if (typeof key === 'string' && sketch) {
      if (sketch[key]) {
        if (typeof sketch[key] === 'function') {
          return sketch[key].apply(sketch, args);
        } else if (args.length === 0) {
          return sketch[key];
        } else if (args.length === 1) {
          return sketch[key] = args[0];
        }
      } else {
        return $.error('Sketch.js did not recognize the given command.');
      }
    } else if (sketch) {
      return sketch;
    } else {
      this.data('sketch', new Sketch(this.get(0), key));
      return this;
    }
  };
  Sketch = (function() {

    function Sketch(el, opts) {
      this.el = el;
      this.canvas = $(el);
      this.context = el.getContext('2d');
      this.options = $.extend({
        toolLinks: true,
        defaultTool: 'marker',
        defaultColor: '#000000',
        defaultSize: 5
      }, opts);
      this.painting = false;
      this.color = this.options.defaultColor;
      this.size = this.options.defaultSize;
      this.tool = this.options.defaultTool;
      this.actions = [];
      this.action = [];
      this.undone = [];
      this.dataURLList = [];
      this.canvas.bind('click mousedown mouseup mousemove mouseleave touchstart touchmove touchend touchcancel mouseenter', this.onEvent);
      if (this.options.toolLinks) {
        $('body').delegate("a[href=\"#" + (this.canvas.attr('id')) + "\"]", 'click', function(e) {
          var $canvas, $this, key, sketch, _i, _len, _ref;
          $this = $(this);
          $canvas = $($this.attr('href'));
          sketch = $canvas.data('sketch');
          _ref = ['color', 'size', 'tool', 'font', 'text'];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            key = _ref[_i];
            if ($this.attr("data-" + key)) {
              sketch.set(key, $(this).attr("data-" + key));
            }
          }
          if ($(this).attr('data-download')) {
            sketch.download($(this).attr('data-download'));
          }
          if ($(this).attr('data-operation')) {
            sketch.operation($(this).attr('data-operation'));
          }
          return false;
        });
      }
    }

    Sketch.prototype.download = function(format) {
      return window.open(this.save(format));
    };

    Sketch.prototype.save = function(format) {
      var mime;
      format || (format = "png");
      if (format === "jpg") {
        format = "jpeg";
      }
      mime = "image/" + format;
      return this.el.toDataURL(mime);
    };

    Sketch.prototype.load = function(dataURL) {
      var img,
        _this = this;
      img = new Image();
      $(img).load(function(e) {
        return _this.context.drawImage(img, 0, 0);
      });
      img.src = dataURL;
      return this.dataURLList.push(img);
    };

    Sketch.prototype.set = function(key, value) {
      this[key] = value;
      return this.canvas.trigger("sketch.change" + key, value);
    };

    Sketch.prototype.startPainting = function() {
      if (!this.painting) {
        this.painting = true;
        return this.action = {
          tool: this.tool,
          color: this.color,
          size: parseFloat(this.size),
          events: []
        };
      }
    };

    Sketch.prototype.stopPainting = function() {
      this.painting = false;
      if (this.action) {
        this.actions.push(this.action);
        this.action = null;
        return this.redraw();
      }
    };

    Sketch.prototype.onEvent = function(e) {
      if (e.originalEvent && e.originalEvent.targetTouches) {
        e.pageX = e.originalEvent.targetTouches[0].pageX;
        e.pageY = e.originalEvent.targetTouches[0].pageY;
      }
      $.sketch.tools[$(this).data('sketch').tool].onEvent.call($(this).data('sketch'), e);
      e.preventDefault();
      return false;
    };

    Sketch.prototype.redraw = function() {
      var sketch,
        _this = this;
      this.el.width = this.canvas.width();
      this.context = this.el.getContext('2d');
      sketch = this;
      $.each(this.dataURLList, function(i, img) {
        return _this.context.drawImage(img, 0, 0);
      });
      $.each(this.actions, function() {
        if (this.tool) {
          return $.sketch.tools[this.tool].draw.call(sketch, this);
        }
      });
      if (this.painting && this.action) {
        return $.sketch.tools[this.action.tool].draw.call(sketch, this.action);
      }
    };

    Sketch.prototype.setupLine = function(action) {
      this.context.lineJoin = "round";
      this.context.lineCap = "round";
      this.context.lineWidth = action.size;
      this.context.strokeStyle = getColor(action);
      return this.context.fillStyle = getColor(action);
    };

    Sketch.prototype.operation = function(mode) {
      switch (mode) {
        case "clear":
          this.actions = [];
          break;
        case "undo":
          if (this.actions && this.actions.length > 0) {
            this.undone.push(this.actions.pop());
          } else {
            alert("Nothing to undo");
          }
          break;
        case "redo":
          if (this.undone && this.undone.length > 0) {
            this.actions.push(this.undone.pop());
          } else {
            alert("Nothing to redo");
          }
      }
      return this.redraw();
    };

    return Sketch;

  })();
  $.sketch = {
    tools: {}
  };
  $.sketch.tools.marker = {
    onEvent: function(e) {
      switch (e.type) {
        case 'mousedown':
        case 'touchstart':
          this.startPainting();
          break;
        case 'mouseup':
        case 'touchend':
        case 'touchcancel':
          this.stopPainting();
      }
      if (this.painting) {
        this.action.events.push({
          x: e.pageX - this.canvas.offset().left,
          y: e.pageY - this.canvas.offset().top,
          event: e.type
        });
        return this.redraw();
      }
    },
    draw: function(action) {
      var event, x, y, _i, _len, _ref;
      this.setupLine(action);
      this.context.beginPath();
      if (action.events.length > 1) {
        this.context.moveTo(action.events[0].x, action.events[0].y);
        _ref = action.events;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          event = _ref[_i];
          this.context.lineTo(event.x, event.y);
        }
        return this.context.stroke();
      } else if (!this.erasing) {
        x = action.events[0].x;
        y = action.events[0].y;
        this.context.arc(x, y, action.size / 2, 0, Math.PI * 2, true);
        this.context.closePath();
        return this.context.fill();
      }
    }
  };
  $.sketch.tools.eraser = {
    onEvent: function(e) {
      return $.sketch.tools.marker.onEvent.call(this, e);
    },
    draw: function(action) {
      var old_color, oldcomposite;
      this.erasing = true;
      old_color = action.color;
      oldcomposite = this.context.globalCompositeOperation;
      this.context.globalCompositeOperation = "copy";
      action.color = "rgba(0,0,0,0)";
      $.sketch.tools.marker.draw.call(this, action);
      this.context.globalCompositeOperation = oldcomposite;
      this.erasing = false;
      return action.color = old_color;
    }
  };
  $.sketch.tools.rectangle = {
    onEvent: $.sketch.tools.marker.onEvent,
    draw: function(action) {
      var event, height, original, width;
      this.setupLine(action);
      original = action.events[0];
      this.context.moveTo(original.x, original.y);
      event = action.events[action.events.length - 1];
      width = event.x - original.x;
      height = event.y - original.y;
      return this.context.strokeRect(original.x, original.y, width, height);
    }
  };
  $.sketch.tools.line = {
    onEvent: $.sketch.tools.marker.onEvent,
    draw: function(action) {
      var event;
      this.setupLine(action);
      event = action.events[action.events.length - 1];
      this.context.beginPath();
      this.context.moveTo(action.events[0].x, action.events[0].y);
      this.context.lineTo(event.x, event.y);
      return this.context.stroke();
    }
  };
  $.sketch.tools.circle = {
    onEvent: $.sketch.tools.marker.onEvent,
    draw: function(action) {
      var centerX, centerY, distance, event, original;
      this.setupLine(action);
      original = action.events[0];
      this.context.moveTo(action.events[0].x, action.events[0].y);
      event = action.events[action.events.length - 1];
      centerX = (event.x + original.x) / 2;
      centerY = (event.y + original.y) / 2;
      distance = Math.sqrt(Math.pow(event.x - original.x, 2) + Math.pow(event.y - original.y, 2)) / 2;
      this.context.beginPath();
      this.context.arc(centerX, centerY, distance, Math.PI * 2, 0, true);
      this.context.stroke();
      return this.context.closePath();
    }
  };
  $.sketch.tools.text = {
    onEvent: function(e) {
      switch (e.type) {
        case 'mouseup':
        case 'touchend':
          this.action = {
            tool: this.tool,
            color: this.color,
            size: parseFloat(this.size),
            font: this.font || 'normal 20px sans-serif',
            events: []
          };
          this.action.events.push({
            x: e.pageX - this.canvas.offset().left,
            y: e.pageY - this.canvas.offset().top,
            event: e.type,
            text: this.text || prompt("Enter text to insert")
          });
          this.actions.push(this.action);
          return this.redraw();
      }
    },
    draw: function(action) {
      var event;
      event = action.events[0];
      if (event.text) {
        this.setupLine(action);
        this.context.font = action.font;
        this.context.fillStyle = getColor(action);
        this.context.textBaseline = "middle";
        return this.context.fillText(event.text, event.x, event.y);
      }
    }
  };
  randomNumber = function() {
    return Math.floor(Math.random() * 256);
  };
  pickRandomColor = function() {
    return "rgb(" + randomNumber() + "," + randomNumber() + "," + randomNumber() + ")";
  };
  return getColor = function(action) {
    if (action.color === 'random') {
      return pickRandomColor();
    } else {
      return action.color;
    }
  };
})(jQuery);