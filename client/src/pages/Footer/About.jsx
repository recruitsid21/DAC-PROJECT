import React from "react";
import RightsFooter from "../../components/rights/RightsFooter";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 flex flex-col justify-between">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            About Evenza
          </h1>

          <div className="prose prose-lg text-gray-500">
            <p className="mb-4">
              Welcome to Evenza, your premier destination for discovering and
              booking exceptional events. Founded with a vision to connect
              people with unforgettable experiences, we've become a trusted
              platform for both event organizers and attendees.
            </p>

            <p className="mb-4">
              Our platform makes it easy to discover, book, and manage tickets
              for a wide range of events – from concerts and conferences to
              workshops and community gatherings.
            </p>

            <p>
              At Evenza, we believe that great events have the power to inspire,
              connect, and transform. We're committed to making these
              experiences accessible to everyone while providing powerful tools
              for event creators to bring their visions to life.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Rights Section */}
      <RightsFooter />
    </div>
  );
};

export default About;
