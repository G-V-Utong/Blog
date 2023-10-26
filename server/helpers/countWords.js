function countWords(sentence) {
    // Use a regular expression to split the sentence into words
    // The regular expression \w+ matches one or more word characters (letters, numbers, or underscores)
    const words = sentence.match(/\w+/g);
  
    // Check if words is null (i.e., there are no words in the sentence)
    if (words === null) {
      return 0;
    }
  
    // Return the length of the array, which is the number of words
    return words.length;
  }
  
  module.exports = {countWords};
  // Example usage:
//   const sentence = "This is an example sentence.";
//   const wordCount = countWords(sentence);
//   console.log(`Word count: ${wordCount}`);