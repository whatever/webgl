% global
global a = [];
global b = [];
global y_approx = [];

%
XX = [-100:100]/100;
YY = zeros(1, 201);
ONES = ones(1, 201);

% f
function y = f(x)
  % x = mod(x+1, 2);
  % x -= 1;
  y = (1 - x .^ 2.0) .^ 0.5;
endfunction

a = zeros(1, 10);
b = zeros(1, 10);
y = zeros(size(XX));

N = 24;

for n = [ 1 : N ]
  a(n) = 1/2*quad(@(x)( f(x) * cos(n * x)), -1, +1);
  b(n) = 1/2*quad(@(x)( f(x) * sin(n * x)), -1, +1);
end

a(1) = 1/4*quad(@(x)( f(x) ), -1, +1) + .75;
b(1) = 0;


XX = [-100:100]/50;

for n = [ 1 : N ]
  YY += (a(n) * cos(n * XX) + b(n) * sin(n * XX))/1.6;
end

plot(XX, f(XX), XX, YY, XX, ifft(fft(f(XX))));

disp("a");
for i = [1:N]
  disp(a(i));
end

disp("b");
for i = [1:N]
  disp(b(i));
end

% for i = [1:N]
%   sprintf("x = %f", b[i]);
% end
