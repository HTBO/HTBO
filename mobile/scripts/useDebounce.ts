export function useDebounce<T>(callback: (args: T) => void, delay: number = 300){
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return (args: T) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
          callback(args);
        }, delay);
      };
}