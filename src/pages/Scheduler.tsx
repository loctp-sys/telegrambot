import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Plus } from 'lucide-react';

export default function Scheduler() {
    const [showForm, setShowForm] = useState(false);

    return (
        <div>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Lên lịch đăng bài</h1>
                    <p className="text-muted-foreground mt-2">Quản lý lịch đăng bài trên các nền tảng</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm lịch
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Chức năng đang phát triển</h3>
                <p className="text-muted-foreground">
                    Tính năng lên lịch đăng bài sẽ sớm được cập nhật
                </p>
            </div>
        </div>
    );
}
