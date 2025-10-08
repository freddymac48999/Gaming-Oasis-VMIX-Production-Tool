# Gaming Oasis VMIX Production Tool

A comprehensive web-based control panel designed to replace Google Sheets workflows for esports production, specifically tailored for Gaming Oasis tournaments. This tool provides real-time data management, team information handling, and seamless integration with VMIX broadcasting software.

## 🎯 Overview

The Gaming Oasis VMIX Production Tool is a Node.js web application that streamlines esports production workflows by providing:

- **Real-time team data management** for Rocket League and VALORANT tournaments
- **Automated API integration** with esports data sources
- **Dynamic sponsor management** system
- **Draw show functionality** for tournament brackets
- **VMIX integration** for live broadcasting
- **Centralized data storage** with JSON persistence

## 🚀 Features

### Core Functionality
- **Multi-Game Support**: Rocket League and VALORANT tournament management
- **Team Data Management**: Automated team information retrieval and manual overrides
- **Sponsor Integration**: Dynamic sponsor logo and information management
- **Draw Show System**: Tournament bracket management with pool-based organization
- **Real-time Updates**: Live data synchronization across all components
- **VMIX Integration**: Direct output formatting for broadcasting software

### User Interface
- **Modern Dark Theme**: Professional esports-focused design
- **Responsive Layout**: Optimized for various screen sizes
- **Intuitive Navigation**: Sidebar-based navigation with clear sections
- **Real-time Feedback**: Live data updates and status indicators
- **Character Limits**: Built-in validation for optimal display formatting

## 📁 Project Structure

```
Gaming-Oasis-VMIX-Production-Tool/
├── index.html              # Main application interface
├── script.js               # Core application logic (8,000+ lines)
├── styles.css              # Comprehensive styling system
├── server.js               # Express.js backend server
├── package.json            # Node.js dependencies
├── Run VMIX Control Panel.bat  # Windows startup script
├── JSONs/                  # Data persistence directory
│   ├── FinalOutput.json    # Main output data
│   ├── sponsors.json       # Sponsor information
│   ├── rloverlay.json      # Rocket League overlay data
│   └── [Tournament Data]   # Tournament-specific JSON files
└── data/JSONs/            # Backup data directory
```

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** (v14 or higher)
- **Windows OS** (for batch file execution)
- **Modern web browser** (Chrome, Firefox, Edge)

### Quick Start
1. **Clone or download** the repository
2. **Run the startup script**:
   ```batch
   Run VMIX Control Panel.bat
   ```
   This will:
   - Check for Node.js installation
   - Install dependencies automatically
   - Start the local server
   - Open the application in your browser

### Manual Setup
If the batch file doesn't work, follow these steps:

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the server**:
   ```bash
   npm start
   ```

3. **Open your browser** and navigate to:
   ```
   http://localhost:5173
   ```

## 🎮 Usage Guide

### Navigation
The application features a sidebar navigation with the following sections:

- **🏠 Welcome**: Application overview and getting started
- **ℹ️ General Info**: Tournament information and talent management
- **⚽ Rocket League**: RL tournament data and team management
- **🎯 VALORANT**: VAL tournament data and team management
- **🏢 Sponsors**: Sponsor information and logo management
- **🎲 Draw Show**: Tournament bracket and pool management
- **⚙️ Settings**: Configuration and API settings
- **🐛 Debug Outputs**: Data inspection and troubleshooting

### Key Features

#### Team Data Management
- **API Integration**: Automatic team data retrieval from esports APIs
- **Manual Overrides**: Custom team information when API data is unavailable
- **Color Management**: Team color selection with similarity detection
- **Logo Handling**: Automatic logo URL processing and display

#### Tournament Management
- **Match Tracking**: Real-time score and series tracking
- **Pool Organization**: Structured tournament bracket management
- **Data Persistence**: Automatic saving of all tournament data
- **Export Functionality**: JSON output for VMIX integration

#### Sponsor System
- **Dynamic Sponsors**: Add/remove sponsors during live events
- **Logo Management**: URL-based sponsor logo integration
- **Toggle System**: Enable/disable sponsors as needed
- **Real-time Updates**: Instant sponsor information updates

## 🔧 Technical Details

### Backend (server.js)
- **Express.js** web server
- **CORS enabled** for cross-origin requests
- **JSON file management** for data persistence
- **RESTful API** endpoints for data operations

### Frontend (script.js)
- **Vanilla JavaScript** (no frameworks)
- **Modular architecture** with organized sections
- **Real-time data binding**
- **Performance optimizations** with element caching
- **Character limit validation**
- **Color similarity algorithms**

### Data Management
- **JSON-based persistence** for all tournament data
- **Automatic file creation** for missing data files
- **Backup system** with duplicate data directories
- **Real-time synchronization** between UI and storage

### API Integration
- **Esports data APIs** for team information
- **Automatic data fetching** with error handling
- **Fallback systems** for API failures
- **Data validation** and sanitization

## 📊 Data Structure

### Tournament Data
```json
{
  "maincaster": "Caster Name",
  "secondcaster": "Co-Caster Name",
  "m1t1name": "Team 1 Name",
  "m1t1logo": "https://logo-url.com",
  "m1t1color": "#FF0000",
  "rlscore1": "3 - 2",
  "rlseriesscore1": "1",
  "rlseriesscore2": "0"
}
```

### Sponsor Data
```json
[
  {
    "id": "sponsor1",
    "name": "Sponsor Name",
    "logo": "https://logo-url.com",
    "enabled": true
  }
]
```

## 🎨 Customization

### Styling
The application uses CSS custom properties for easy theming:
```css
:root {
  --bg: #0f1420;
  --panel: #151c2b;
  --accent: #3a9bd1;
  --text: #e9f0f6;
}
```

### Character Limits
Built-in validation for optimal display:
- **Caster Names**: 16 characters
- **Social Handles**: 15 characters
- **Team Names**: 13 characters
- **Interview Names**: 12 characters

## 🔍 Troubleshooting

### Common Issues

1. **Server won't start**:
   - Ensure Node.js is installed
   - Check if port 5173 is available
   - Run `npm install` manually

2. **Data not saving**:
   - Check JSONs directory permissions
   - Verify server is running
   - Check browser console for errors

3. **API data not loading**:
   - Verify internet connection
   - Check API key configuration
   - Review browser network tab

### Debug Mode
Use the **🐛 Debug Outputs** section to:
- Inspect current data state
- Verify API responses
- Check data persistence
- Monitor real-time updates

## 🤝 Contributing

This tool is specifically designed for Gaming Oasis esports production. For modifications:

1. **Backup your data** before making changes
2. **Test thoroughly** with sample tournament data
3. **Maintain JSON structure** for VMIX compatibility
4. **Document changes** for team members

## 📝 License

This project is proprietary to Gaming Oasis and designed for internal esports production use.

## 🆘 Support

For technical support or feature requests, contact the Gaming Oasis development team.

---

**Built for Gaming Oasis Esports Production** 🎮