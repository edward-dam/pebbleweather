// Author: Ed Dam

module.exports = [
  {
    "type": "heading",
    "defaultValue": "Weather v1.2"
  },
  {
    "type": "text",
    "defaultValue": "by Edward Dam"
  },
  { "type": "section", "items": [
    { "type": "heading", "defaultValue": "Temperature" },
    { "type": "text", "defaultValue": "Please Choose Fahrenheit or Celsius" },
    { "type": "radiogroup", "messageKey": "temp_degrees", "options": [
      { "label": "Fahrenheit °F", "value": "fahrenheit" },
      { "label": "Celsius °C", "value": "celsius" } ],
    "defaultValue": "fahrenheit" } ]
  },
  {
    "type": "text",
    "defaultValue": "Powered by DarkSky.net"
  },
  {
    "type": "submit",
    "defaultValue": "Submit"
  }
];
