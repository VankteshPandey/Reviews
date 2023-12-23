const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4000;


const reviewsDataPath = path.join(__dirname, 'reviewsData.json');

const calculateAverageRating = (ratings) => {
  const totalRatings = ratings.length;
  const totalRating = ratings.reduce((sum, rating) => sum + rating, 0);
  const averageRating = totalRating / totalRatings;
  return averageRating;
};

const main = async () => {
  try {
    // Read reviews data from the JSON file
    const reviewsData = await require(reviewsDataPath);

    // Calculate average rating for each restaurant
    const restaurants = {};

    reviewsData.forEach(({ review }) => {
      const restaurantName = review.userName; 
      const rating = review.rating;

      if (!restaurants[restaurantName]) {
        restaurants[restaurantName] = { ratings: [rating] };
      } else {
        restaurants[restaurantName].ratings.push(rating);
      }
    });

    // Display the findings
    console.log('Average Ratings for Each Restaurant:');
    for (const [restaurantName, data] of Object.entries(restaurants)) {
      const averageRating = calculateAverageRating(data.ratings);
      console.log(`${restaurantName}: ${averageRating.toFixed(2)}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// Set up a GET endpoint to show raw JSON data
app.get('/rawdata', (req, res) => {
  fs.readFile(reviewsDataPath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).json({ error: 'Error reading JSON data' });
    } else {
      res.json(JSON.parse(data));
    }
  });
});

// Set up a GET endpoint to show analysis results
app.get('/analysis', (req, res) => {
  // Re-run the analysis before sending the results
  main();
  res.status(200).send('Check the console for analysis results.');
});

// Run the Express server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

