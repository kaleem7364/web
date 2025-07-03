document.addEventListener('DOMContentLoaded', () => {
  const stockForm = document.getElementById('stockForm');
  const compareForm = document.getElementById('compareForm');
  const resultDiv = document.getElementById('result');

  stockForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const stock = document.getElementById('stock').value;
    const like = document.getElementById('like').checked;
    
    try {
      const response = await fetch(`/api/stock-prices?stock=${stock}&like=${like}`);
      const data = await response.json();
      
      if (data.error) {
        resultDiv.textContent = `Error: ${data.error}`;
      } else {
        const { stockData } = data;
        resultDiv.textContent = `Stock: ${stockData.stock}
Price: $${stockData.price}
Likes: ${stockData.likes}`;
      }
    } catch (err) {
      resultDiv.textContent = 'Error fetching stock data';
      console.error(err);
    }
  });

  compareForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const stock1 = document.getElementById('stock1').value;
    const stock2 = document.getElementById('stock2').value;
    const likeBoth = document.getElementById('likeBoth').checked;
    
    try {
      const response = await fetch(
        `/api/stock-prices?stock=${stock1}&stock=${stock2}&like=${likeBoth}`
      );
      const data = await response.json();
      
      if (data.error) {
        resultDiv.textContent = `Error: ${data.error}`;
      } else {
        const [stockData1, stockData2] = data.stockData;
        resultDiv.textContent = `Comparison:
${stockData1.stock}: $${stockData1.price} (Relative Likes: ${stockData1.rel_likes})
${stockData2.stock}: $${stockData2.price} (Relative Likes: ${stockData2.rel_likes})`;
      }
    } catch (err) {
      resultDiv.textContent = 'Error comparing stocks';
      console.error(err);
    }
  });
});
