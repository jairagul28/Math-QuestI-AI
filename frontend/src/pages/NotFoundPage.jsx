import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto text-3xl font-black shadow-md">
          404
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900">Quest Not Found</h1>
          <p className="text-sm text-slate-500 font-medium">
            Looks like this math territory hasn't been charted yet!
          </p>
        </div>
        <div>
          <Link to="/">
            <Button variant="playful" size="md" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Return to Safety
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

