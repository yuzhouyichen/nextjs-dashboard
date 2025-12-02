// 这是一个客户端组件，这意味着您可以使用事件监听器和钩子。
'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, useRouter ,usePathname} from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export default function Search({ placeholder }: { placeholder: string }) {
  // 获取当前URL的查询参数
  const searchParams = useSearchParams();
  console.log(searchParams.toString(), 'searchParams');
  const pathname = usePathname();
  const { replace } = useRouter();
  console.log(pathname, 'pathname');
  console.log(replace, 'replace');

  // 处理搜索查询 使用 useDebouncedCallback 防止频繁触发
  const handleSearch = useDebouncedCallback((term: string) => {
    console.log(`Searching... ${term}`);

    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (term) {
      // 如果用户输入不为空，则设置查询参数
      params.set('query', term);
    } else {
      // 如果用户输入为空，则删除查询参数
      params.delete('query');
    }
    console.log(params.toString());

    // 1. 更新浏览器地址栏的 URL（添加或更新查询参数）
    // 2. 不新增历史记录条目（与 push 不同，使用push，点击后退会回到上一页）
    // 3. 触发页面重新渲染（因为 URL 变化，searchParams 会更新）
    replace(`${pathname}?${params.toString()}`);
  }, 300);
  
  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      {/* 这是一个输入框，它允许用户输入搜索查询。 */}
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => handleSearch(e.target.value)}
        // 设置输入框的默认值为查询参数中的query值
        defaultValue={searchParams.get('query')?.toString()}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
