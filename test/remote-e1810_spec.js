var helper = require("node-red-node-test-helper");
var E1810NodeNode = require("../nodes/remote-e1810.js");
helper.init(require.resolve('node-red'));

describe('e1810 Node', function () {

  afterEach(function () {
    helper.unload();
  });

  it('should be loaded', function (done) {
    var flow = [{ id: "n1", type: "e1810-node", name: "test name" }];
    helper.load(E1810NodeNode, flow, function () {
      var n1 = helper.getNode("n1");
      n1.should.have.property('name', 'test name');
      done();
    });
  });

  it('should have device_ieee property', function(done) {
    var flow = [{ id: "n1", type: "e1810-node", name: "test name", device_ieee: "123" }];
    helper.load(E1810NodeNode, flow, function () {
        try {
            var n1 = helper.getNode("n1");
      n1.should.have.property('device_ieee', '123');
      done();
            
        } catch (error) {
            done(error);
        }
      
    });
  })
});