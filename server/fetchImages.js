import fs from 'fs';

const cities = [
  { from: 'Chennai', to: 'Bangalore', duration: '6h 15m', price: 849, tag: 'Daily Service' },
  { from: 'Mumbai', to: 'Pune', duration: '3h 00m', price: 399, tag: 'Express Route' },
  { from: 'Delhi', to: 'Agra', duration: '4h 30m', price: 650, tag: 'Premium Fleet' },
  { from: 'Hyderabad', to: 'Vijayawada', duration: '5h 10m', price: 599, tag: 'Night Service' },
  { from: 'Bangalore', to: 'Goa', duration: '11h 20m', price: 1250, tag: 'Sleeper Coach' },
  { from: 'Chennai', to: 'Madurai', duration: '7h 45m', price: 799, tag: 'Direct Route' },
  { from: 'Delhi', to: 'Jaipur', duration: '5h 00m', price: 600, tag: 'Superfast' },
  { from: 'Ahmedabad', to: 'Surat', duration: '4h 15m', price: 450, tag: 'Morning Express' },
  { from: 'Pune', to: 'Nagpur', duration: '12h 30m', price: 1400, tag: 'Luxury Sleeper' },
  { from: 'Kolkata', to: 'Siliguri', duration: '14h 00m', price: 1100, tag: 'Scenic Route' },
  { from: 'Bangalore', to: 'Mysore', duration: '3h 15m', price: 350, tag: 'Daily Commute' },
  { from: 'Mumbai', to: 'Goa', duration: '14h 00m', price: 1550, tag: 'Premium Fleet' },
  { from: 'Chandigarh', to: 'Shimla', duration: '3h 45m', price: 299, tag: 'Hill Service' },
  { from: 'Lucknow', to: 'Varanasi', duration: '6h 30m', price: 550, tag: 'Daily Service' },
  { from: 'Kochi', to: 'Thiruvananthapuram', duration: '5h 20m', price: 499, tag: 'Coastal Express' },
];

async function getImg(city) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(city)}&prop=pageimages&format=json&pithumbsize=800`;
  const res = await fetch(url);
  const data = await res.json();
  const pages = data.query.pages;
  const pageId = Object.keys(pages)[0];
  const urlRes = pages[pageId] && pages[pageId].thumbnail ? pages[pageId].thumbnail.source : 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800';
  return urlRes;
}

async function run() {
  const lines = [];
  for (const c of cities) {
    const img = await getImg(c.to);
    lines.push(`  { from: '${c.from}', to: '${c.to}', duration: '${c.duration}', price: ${c.price}, tag: '${c.tag}', img: '${img}' },`);
  }
  
  const formatted = "const ALL_DESTINATIONS = [\n" + lines.join("\n") + "\n];";
  
  const filePath = 'c:\\busgo\\client\\src\\pages\\Destinations.jsx';
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/const ALL_DESTINATIONS = \[[\s\S]*?\];/, formatted);
  fs.writeFileSync(filePath, content);
  console.log("Written successfully");
}

run();
