import JSONFormatter from '../components/JSONFormatter';

const JSONFormatterPage = () => {
  return (
    <div className="container py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">JSON 포맷터 & 검증기</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          JSON 데이터를 포맷팅하고, 압축하며, 유효성을 검증하세요. 
          개발자를 위한 필수 JSON 처리 도구입니다.
        </p>
      </div>
      
      <JSONFormatter />
    </div>
  );
};

export default JSONFormatterPage; 