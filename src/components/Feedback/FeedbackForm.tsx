import { useState } from 'react';
import { MessageSquare, Star, Send } from 'lucide-react';

// Extended country list for feedback form
const countryOptions = [
  'United States', 'Nigeria', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France',
  'India', 'China', 'Japan', 'Brazil', 'Mexico', 'South Africa', 'Kenya', 'Ghana',
  'Egypt', 'Morocco', 'Algeria', 'Tunisia', 'Libya', 'Sudan', 'Ethiopia', 'Somalia',
  'Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Jordan', 'Lebanon',
  'Israel', 'Palestine', 'Turkey', 'Iran', 'Iraq', 'Syria', 'Yemen', 'Afghanistan',
  'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal', 'Bhutan', 'Myanmar', 'Thailand',
  'Vietnam', 'Laos', 'Cambodia', 'Malaysia', 'Singapore', 'Indonesia', 'Philippines',
  'South Korea', 'North Korea', 'Mongolia', 'Taiwan', 'Hong Kong', 'Macau',
  'Russia', 'Ukraine', 'Poland', 'Czech Republic', 'Slovakia', 'Hungary', 'Romania',
  'Bulgaria', 'Serbia', 'Croatia', 'Bosnia', 'Slovenia', 'Albania', 'North Macedonia',
  'Greece', 'Cyprus', 'Malta', 'Italy', 'Spain', 'Portugal', 'Andorra', 'Monaco',
  'Switzerland', 'Austria', 'Belgium', 'Netherlands', 'Luxembourg', 'Ireland', 'Iceland',
  'Denmark', 'Sweden', 'Norway', 'Finland', 'Estonia', 'Latvia', 'Lithuania', 'Belarus',
  'Moldova', 'Georgia', 'Armenia', 'Azerbaijan', 'Kazakhstan', 'Uzbekistan', 'Turkmenistan',
  'Kyrgyzstan', 'Tajikistan', 'Mongolia', 'Australia', 'New Zealand', 'Papua New Guinea',
  'Fiji', 'Samoa', 'Tonga', 'Vanuatu', 'Solomon Islands', 'Mauritius', 'Seychelles',
  'Maldives', 'Indonesia', 'Timor-Leste', 'Brunei', 'Myanmar', 'Laos', 'Cambodia',
  'Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'Guyana', 'Paraguay',
  'Peru', 'Suriname', 'Uruguay', 'Venezuela', 'French Guiana', 'Falkland Islands',
  'Bahamas', 'Barbados', 'Belize', 'Costa Rica', 'Cuba', 'Dominica', 'Dominican Republic',
  'El Salvador', 'Grenada', 'Guatemala', 'Haiti', 'Honduras', 'Jamaica', 'Nicaragua',
  'Panama', 'Puerto Rico', 'Saint Kitts', 'Saint Lucia', 'Saint Vincent', 'Trinidad',
  'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cameroon',
  'Central African Republic', 'Chad', 'Comoros', 'Congo', 'Djibouti', 'Equatorial Guinea',
  'Eritrea', 'Eswatini', 'Gabon', 'Gambia', 'Guinea', 'Guinea-Bissau', 'Ivory Coast',
  'Lesotho', 'Liberia', 'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mauritius',
  'Mozambique', 'Namibia', 'Niger', 'Rwanda', 'Sao Tome', 'Senegal', 'Seychelles',
  'Sierra Leone', 'Somalia', 'South Sudan', 'Sudan', 'Tanzania', 'Togo', 'Tunisia',
  'Uganda', 'Zambia', 'Zimbabwe'
].sort();

export const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 5,
    message: '',
    buildingType: '',
    country: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formEndpoint = 'https://formsubmit.co/ajax/fawaznuhu93@gmail.com';
    
    try {
      const response = await fetch(formEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          _subject: `Blueprint Generator Feedback - ${formData.rating} Stars`,
          _template: 'table',
          _captcha: 'false'
        })
      });
      
      if (response.ok) {
        setIsSubmitted(true);
        setFormData({
          name: '',
          email: '',
          rating: 5,
          message: '',
          buildingType: '',
          country: ''
        });
        setTimeout(() => setIsSubmitted(false), 5000);
      }
    } catch (error) {
      console.error('Feedback submission failed:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <MessageSquare className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Help Us Improve</h3>
          <p className="text-gray-600">Your feedback helps shape the future of Blueprint Generator</p>
        </div>
      </div>
      
      {isSubmitted ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">🎉</div>
          <h4 className="font-semibold text-green-800">Thank You!</h4>
          <p className="text-sm text-green-700">Your feedback has been submitted successfully.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Building Type Used</label>
              <select
                value={formData.buildingType}
                onChange={(e) => setFormData({ ...formData, buildingType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select building type</option>
                <option value="bungalow">Bungalow</option>
                <option value="duplex">Duplex</option>
                <option value="apartment">Apartment</option>
                <option value="villa">Villa</option>
                <option value="townhouse">Townhouse</option>
                <option value="mansion">Mansion</option>
                <option value="shop">Shop</option>
                <option value="office">Office</option>
                <option value="restaurant">Restaurant</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select country</option>
                {countryOptions.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= formData.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Feedback / Suggestions</label>
            <textarea
              required
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What did you like? What can we improve?"
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit Feedback'}</span>
          </button>
          
          <p className="text-xs text-gray-500 text-center mt-4">
            Your feedback helps us improve. We read every submission!
          </p>
        </form>
      )}
    </div>
  );
};