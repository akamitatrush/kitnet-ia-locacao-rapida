import React from 'react';
import { Layout } from '@/components/Layout';
import { ChatSystem } from '@/components/ChatSystem';
import { AuthProvider } from '@/components/AuthProvider';

const Mensagens = () => {
  return (
    <AuthProvider>
      <Layout showSidebar>
        <div className="container mx-auto px-4 py-8">
          <ChatSystem />
        </div>
      </Layout>
    </AuthProvider>
  );
};

export default Mensagens;