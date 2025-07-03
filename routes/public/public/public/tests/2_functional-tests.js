const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');

chai.use(chaiHttp);
const expect = chai.expect;

describe('Stock Price Checker', () => {
  before(() => {
    // يمكنك إضافة أي إعدادات قبل الاختبار هنا
  });

  it('Viewing one stock', (done) => {
    chai
      .request(app)
      .get('/api/stock-prices?stock=GOOG')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('stockData');
        expect(res.body.stockData).to.have.property('stock', 'GOOG');
        expect(res.body.stockData).to.have.property('price');
        expect(res.body.stockData).to.have.property('likes', 0);
        done();
      });
  });

  it('Viewing one stock and liking it', (done) => {
    chai
      .request(app)
      .get('/api/stock-prices?stock=MSFT&like=true')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.stockData.likes).to.be.at.least(1);
        done();
      });
  });

  it('Viewing the same stock and liking it again', (done) => {
    chai
      .request(app)
      .get('/api/stock-prices?stock=MSFT&like=true')
      .end((err, res) => {
        expect(res).to.have.status(200);
        // يجب أن يبقى عدد الإعجابات كما هو لأن نفس IP يحاول الإعجاب مرة أخرى
        done();
      });
  });

  it('Viewing two stocks', (done) => {
    chai
      .request(app)
      .get('/api/stock-prices?stock=AAPL&stock=AMZN')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('stockData').with.lengthOf(2);
        expect(res.body.stockData[0]).to.have.property('rel_likes');
        expect(res.body.stockData[1]).to.have.property('rel_likes');
        done();
      });
  });

  it('Viewing two stocks and liking them', (done) => {
    chai
      .request(app)
      .get('/api/stock-prices?stock=AAPL&stock=AMZN&like=true')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.stockData[0].rel_likes + res.body.stockData[1].rel_likes).to.equal(0);
        done();
      });
  });
});
