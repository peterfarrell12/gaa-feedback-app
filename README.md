# TeamSync Feedback System - Development Tool

A comprehensive web application for developing and testing the TeamSync Feedback System Bubble plugin for GAA teams.

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ installed
- Basic knowledge of GAA and TeamSync platform

### Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   ```
   http://localhost:3001
   ```

## 📋 Features

### 🎯 **Testing Dashboard**
- Component testing for all plugin elements
- Workflow simulation for coaches and players
- Real-time test result monitoring
- Comprehensive test suite with pass/fail tracking

### 📊 **Analytics & Insights**
- Mock data visualization
- Response analytics and metrics
- Anonymous response tracking
- Performance insights

### 🛠️ **Development Tools**
- Template library management
- Form creation and testing
- Response data visualization
- Plugin code viewer and export

### 📱 **Plugin Components**
- **Template Selector**: Test GAA-specific feedback templates
- **Form Builder**: Interactive form creation and customization
- **Form Renderer**: Mobile-optimized player experience simulation
- **Results Dashboard**: Analytics and insights generation

## 🏈 GAA-Specific Features

### Templates Included:
1. **Post-Match Standard Review**
   - Performance assessment
   - Tactical analysis
   - Team dynamics evaluation

2. **Training Session Review**
   - Session quality feedback
   - Skill development tracking
   - Training environment assessment

3. **Player Development Review**
   - Self-assessment tools
   - Goal setting framework
   - Support feedback collection

## 🔧 Usage Guide

### 1. **Generate Mock Data**
- Click "Generate Mock Data" to create realistic test data
- Includes 25+ GAA players, events, forms, and responses
- Realistic Irish names and GAA positions

### 2. **Run Component Tests**
- Navigate to "Testing" tab
- Test individual components or run full suite
- View detailed test results and data

### 3. **Simulate Workflows**
- **Coach Workflow**: Template selection → Form building → Response monitoring
- **Player Workflow**: Form notification → Anonymous option → Response submission

### 4. **View Analytics**
- Response rates and completion times
- Anonymous vs. identified response ratios
- Question-level analysis and insights

### 5. **Export Plugin**
- View complete plugin code
- Export for Bubble.io deployment
- Installation guide included

## 📁 Project Structure

```
gaa-feedback-wireframes/
├── server.js                 # Express.js server
├── package.json              # Dependencies and scripts
├── feedback-system.js        # Bubble plugin code
├── public/
│   ├── index.html            # Main web interface
│   ├── css/style.css         # Styling
│   └── js/app.js             # Frontend JavaScript
└── README.md                 # This file
```

## 🔌 API Endpoints

### Data Management
- `GET /api/data` - Get all mock data
- `GET /api/templates` - Get template library
- `POST /api/generate-mock-data` - Generate realistic test data

### Testing
- `POST /api/test/template-selector` - Test template component
- `POST /api/test/form-builder` - Test form builder
- `POST /api/test/form-renderer` - Test player form
- `POST /api/test/results-dashboard` - Test analytics

### Forms & Responses
- `POST /api/forms/create` - Create new feedback form
- `POST /api/responses/submit` - Submit test response
- `GET /api/forms/:id/analytics` - Get form analytics

### Plugin
- `GET /api/plugin-code` - Get plugin source code

## 🎮 Interactive Features

### Testing Dashboard
- **Component Tests**: Individual plugin element validation
- **Workflow Simulations**: End-to-end user journey testing
- **Real-time Results**: Live test execution monitoring

### Data Visualization
- **Response Analytics**: Charts and metrics
- **Anonymous Tracking**: Privacy-compliant insights
- **Performance Metrics**: Completion rates and timing

### Development Tools
- **Live Plugin Preview**: See plugin code changes
- **Mock Data Generator**: Realistic GAA team data
- **Export Functionality**: Ready-to-deploy plugin files

## 🌟 Key Benefits

### For Plugin Development:
- **Rapid Prototyping**: Test ideas quickly
- **Realistic Testing**: GAA-specific scenarios
- **Quality Assurance**: Comprehensive test coverage

### For GAA Teams:
- **Anonymous Feedback**: Honest player input
- **Mobile Optimized**: Easy completion on phones
- **Actionable Insights**: Improve team performance

### For TeamSync Integration:
- **Bubble-Native**: Designed for Bubble.io platform
- **Database Ready**: Matches TeamSync data structure
- **Workflow Compatible**: Integrates with existing flows

## 🚀 Deployment

### For Bubble.io:
1. Copy contents of `feedback-system.js`
2. Paste into Bubble plugin editor
3. Configure data types as documented
4. Set up workflows and privacy rules

### For Development:
```bash
# Development with auto-reload
npm run dev

# Production mode
npm start

# Run tests only
npm test
```

## 🔍 Testing Scenarios

### Coach Workflows:
- Template selection and customization
- Form creation and distribution
- Response monitoring and analytics
- Report generation and export

### Player Workflows:
- Form notification and opening
- Anonymous option consideration
- Question completion and navigation
- Submission and confirmation

### System Testing:
- Database operations and privacy
- Mobile responsiveness
- Performance under load
- Anonymous response handling

## 📈 Analytics & Insights

### Response Metrics:
- Total and anonymous response counts
- Response rates by player position
- Average completion times
- Question-level analysis

### Team Insights:
- Performance trend tracking
- Communication effectiveness
- Tactical feedback analysis
- Development opportunity identification

## 🛡️ Privacy & Security

### Anonymous Responses:
- Complete user identity protection
- No IP tracking or device fingerprinting
- Aggregated analytics only
- GDPR-compliant data handling

### Data Protection:
- Club-specific data isolation
- Role-based access controls
- Secure response storage
- Privacy-first design

## 🤝 Contributing

This development tool is designed to facilitate the creation and testing of the TeamSync Feedback System. Use it to:

1. **Test Plugin Components** before Bubble deployment
2. **Simulate User Workflows** with realistic GAA scenarios
3. **Generate Mock Data** for comprehensive testing
4. **Validate Analytics** and insight generation
5. **Export Ready Code** for production deployment

## 📞 Support

For questions about:
- **Plugin Development**: Check the testing dashboard results
- **GAA Integration**: Review the template library
- **Bubble Deployment**: See the export functionality
- **TeamSync Integration**: Refer to the API documentation

---

**Built for GAA teams, by developers who understand the beautiful game.** 🏈

*Sláinte!*